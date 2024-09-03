import {
  createPXEClient,
  waitForPXE,
  PXE,
  AztecAddress,
  Fr,
  GrumpkinScalar,
  Contract,
  AccountWallet,
  AuthWitness,
} from "@aztec/aztec.js";
import { TokenContract, TokenContractArtifact } from "@aztec/noir-contracts.js/Token";
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { AccountManager, type Salt } from '@aztec/aztec.js/account';
interface WalletLike {
  getAddress(): Promise<AztecAddress>;
  // Add any other methods that you need from the wallet
}
class WalletConnector {
  private pxe: PXE | null = null;
  private wallet: any = null;

  async initializePXE(): Promise<void> {
    this.pxe = createPXEClient("http://localhost:8080");
    await waitForPXE(this.pxe);
  }

  async connectWallet(): Promise<string> {
    if (!this.pxe) {
      throw new Error("PXE not initialized. Call initializePXE first.");
    }

    const secretKey = Fr.random();
    const signingPrivateKey = GrumpkinScalar.random();
    this.wallet = await getSchnorrAccount(this.pxe, secretKey, signingPrivateKey);

    return (await this.wallet.getAddress()).toString();
  }

  async deployToken(name: string, symbol: string, decimals: number): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const deployedContract = await TokenContract.deploy(
      this.wallet,
      await this.wallet.getAddress(),
      name,
      symbol,
      BigInt(decimals)
    ).send().deployed();

    return deployedContract.address.toString();
  }

  async mintTokens(tokenAddress: string, amount: number): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const contract = await TokenContract.at(AztecAddress.fromString(tokenAddress), this.wallet);
    const tx = await contract.methods.mint_public(await this.wallet.getAddress(), new Fr(amount)).send().wait();

    return tx.txHash.toString();
  }

  async checkBalance(tokenAddress: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const contract = await TokenContract.at(AztecAddress.fromString(tokenAddress), this.wallet);
    const balance = await contract.methods.balance_of_public(await this.wallet.getAddress()).simulate();

    return balance.toString();
  }
}

export const walletConnector = new WalletConnector();