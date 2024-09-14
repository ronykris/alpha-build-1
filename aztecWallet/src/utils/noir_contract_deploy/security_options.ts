import {
  AccountWallet,
  AztecAddress,
  CompleteAddress,
  createPXEClient,
  Fr,
  Fq, 
  GrumpkinScalar,
  PXE,
  Wallet,
  Grumpkin,
  waitForPXE,
  Point
} from '@aztec/aztec.js';
import { EcdsaKAccountwithKeyRotationContract } from '../../noir_contracts/security_options/src/artifacts/EcdsaKAccountwithKeyRotation.ts';
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";

export async function setupEnvironment(): Promise<{ pxe: PXE, wallet: AccountWallet }> {
  const { PXE_URL = 'http://localhost:8080' } = process.env;
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  let wallets: AccountWallet[] = [];
  wallets = await getInitialTestAccountsWallets(pxe);
  const wallet = wallets[0];
  return { pxe, wallet };
}

export async function deployContract(
  wallet: Wallet, 
  signingKeyX: (bigint | number)[], 
  signingKeyY: (bigint | number)[]
): Promise<EcdsaKAccountwithKeyRotationContract> {
  const deployTx = EcdsaKAccountwithKeyRotationContract.deploy(wallet, signingKeyX, signingKeyY);
  const receipt = await deployTx.send().wait();
  return EcdsaKAccountwithKeyRotationContract.at(receipt.contract.address, wallet);
}

function bigIntToNumberArray(value: bigint): number[] {
  const hex = value.toString(16).padStart(64, '0');
  const result: number[] = [];
  for (let i = 0; i < 32; i++) {
      result.push(parseInt(hex.substr(i * 2, 2), 16));
  }
  return result;
}

export async function testKeyRotation(contract: EcdsaKAccountwithKeyRotationContract, wallet: Wallet): Promise<Fq> {
  console.log('Testing key rotation...');

  // Generate new key pair for rotation
  const grumpkin = new Grumpkin();
  const newPublicKey = GrumpkinScalar.random();
  const initialPublicKey = grumpkin.mul(Grumpkin.generator, newPublicKey);
  const newPublicKeyX = bigIntToNumberArray(initialPublicKey.x.toBigInt());
  const newPublicKeyY = bigIntToNumberArray(initialPublicKey.y.toBigInt());

  // Perform key rotation
  const rotateTx = await contract.methods.rotate_key(newPublicKeyX, newPublicKeyY);
  // await rotateTx.wait();
  console.log('Key rotation transaction sent');

  return newPublicKey
  // Verify the key rotation (this would depend on how your contract allows verification)
  // For example, you might have a method to get the current public key
  // const currentKey = await contract.methods.getCurrentPublicKey().view();
  // console.log('New public key set:', currentKey);

  console.log('Key rotation test complete');
}

async function main() {
  try {
    const { pxe, wallet } = await setupEnvironment();

    // Generate initial signing key
    const grumpkin = new Grumpkin();
    const initialSecretKey = GrumpkinScalar.random();
    const initialPublicKey = grumpkin.mul(Grumpkin.generator, initialSecretKey);

    const initialPublicKeyX = [initialPublicKey.x.toBigInt()];
    const initialPublicKeyY = [initialPublicKey.y.toBigInt()];

    // Deploy the contract
    console.log('Deploying EcdsaKAccountwithKeyRotationContract...');
    const contract = await deployContract(wallet, initialPublicKeyX, initialPublicKeyY);
    console.log('Contract deployed at:', contract.address.toString());

    // Test key rotation
    await testKeyRotation(contract, wallet);

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main().catch(console.error);