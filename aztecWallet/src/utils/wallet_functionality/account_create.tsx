import { Fr, AztecAddress } from '@aztec/circuits.js';
import { PXE, AccountManager, AccountWalletWithSecretKey } from '@aztec/aztec.js';
import { DebugLogger } from '@aztec/foundation/log';

export const AccountTypes = ['schnorr', 'ecdsasecp256r1ssh', 'ecdsasecp256k1'] as const;
export type AccountType = (typeof AccountTypes)[number];

interface CreateAccountOptions {
  accountType: AccountType;
  publicKey?: string;
  registerOnly?: boolean;
  publicDeploy?: boolean;
  skipInitialization?: boolean;
  wait?: boolean;
}

export async function createAccount(
  pxe: PXE,
  options: CreateAccountOptions,
  debugLogger: DebugLogger
): Promise<{ address: string; publicKey: string; secretKey: string; }> {
  const secretKey = Fr.random();
  const account = await createOrRetrieveAccount(
    pxe,
    undefined,
    undefined,
    options.accountType,
    secretKey,
    Fr.ZERO,
    options.publicKey
  );

  const { address, publicKeys } = account.getCompleteAddress();

  if (!options.registerOnly) {
    const wallet = await account.getWallet();
    const tx = account.deploy({
      skipClassRegistration: !options.publicDeploy,
      skipPublicDeployment: !options.publicDeploy,
      skipInitialization: options.skipInitialization,
    });

    const txHash = await tx.getTxHash();
    debugLogger.debug(`Account contract tx sent with hash ${txHash}`);

    if (options.wait) {
      await tx.wait();
    }
  }

  return {
    address: address.toString(),
    publicKey: publicKeys.toString(),
    secretKey: secretKey.toString(),
  };
}

async function createOrRetrieveAccount(
  pxe: PXE,
  address: AztecAddress | undefined,
  db: any | undefined,
  type: AccountType,
  secretKey: Fr,
  salt: Fr,
  publicKey: string | undefined
): Promise<AccountManager> {
  // This is a simplified version. In a real implementation, you'd use the 
  // actual account creation logic from the Aztec SDK.
  return {
    getCompleteAddress: () => ({
      address: AztecAddress.random(),
      publicKeys: 'simulated_public_key',
    }),
    getWallet: async () => ({ /* simulated wallet */ }),
    deploy: () => ({
      getTxHash: async () => 'simulated_tx_hash',
      wait: async () => {},
    }),
  } as any;
}

export async function addScopeToWallet(
  wallet: AccountWalletWithSecretKey, 
  scope: AztecAddress
): Promise<void> {
  const address = wallet.getAddress().toString();
  const currentScopes = wallet.getScopes() ?? [];
  const deduplicatedScopes = Array.from(
    new Set([address, ...currentScopes, scope].map(scope => scope.toString())).values(),
  );
  wallet.setScopes(deduplicatedScopes.map(scope => AztecAddress.fromString(scope)));
}

export async function getWalletWithScopes(
  account: AccountManager
): Promise<AccountWalletWithSecretKey> {
  const wallet = await account.getWallet();
  const address = wallet.getAddress().toString();
  const currentScopes = wallet.getScopes()?.map(scopes => scopes.toString()) ?? [];
  const deduplicatedScopes = Array.from(new Set([address, ...currentScopes]).values()).map(scope =>
    AztecAddress.fromString(scope)
  );
  wallet.setScopes(deduplicatedScopes);
  return wallet;
}

export function addAccountIntegrationToStore(set: any, get: any) {
  return {
    createAccount: async (options: CreateAccountOptions) => {
      const { pxe } = get();
      if (!pxe) {
        set({ pxeError: 'PXE not initialized. Please initialize PXE first.' });
        return;
      }

      try {
        const debugLogger = {
          debug: (message: string) => console.log(message),
        } as DebugLogger;

        const newAccount = await createAccount(pxe, options, debugLogger);
        set((state: any) => ({
          pxeAccounts: [...state.pxeAccounts, newAccount],
          address: newAccount.address,
          pxeError: null,
        }));
        return newAccount;
      } catch (error) {
        console.error('Failed to create account:', error);
        set({ pxeError: error instanceof Error ? error.message : 'Unknown error creating account' });
      }
    },
    addScopeToWallet: async (scope: string) => {
      const { pxe, address } = get();
      if (!pxe || !address) {
        set({ pxeError: 'PXE or address not initialized.' });
        return;
      }

      try {
        const account = await createOrRetrieveAccount(pxe, AztecAddress.fromString(address), undefined, 'schnorr', undefined, undefined, undefined);
        const wallet = await getWalletWithScopes(account);
        await addScopeToWallet(wallet, AztecAddress.fromString(scope));
        set({ pxeError: null });
      } catch (error) {
        console.error('Failed to add scope to wallet:', error);
        set({ pxeError: error instanceof Error ? error.message : 'Unknown error adding scope to wallet' });
      }
    },
  };
}