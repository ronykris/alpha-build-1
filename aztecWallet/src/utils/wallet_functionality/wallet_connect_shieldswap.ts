import { createPXEClient, waitForPXE, PXE, AztecAddress, Fr } from "@aztec/aztec.js";
import { ShieldswapWalletSdk } from "@shieldswap/wallet-sdk";
import { TokenContract } from "@aztec/noir-contracts.js/Token";
import { Wallet } from "@aztec/aztec.js";


class WalletConnector {
  private pxe: PXE | null = null;
  private wallet: ShieldswapWalletSdk | null = null;

  async initializePXE(): Promise<void> {
    this.pxe = createPXEClient("http://localhost:8080");
    await waitForPXE(this.pxe);
  }

  async connectWallet(projectId: string): Promise<string> {
    if (!this.pxe) {
      throw new Error("PXE not initialized. Call initializePXE first.");
    }

    this.wallet = new ShieldswapWalletSdk(
      {
        projectId: "1a51576d0996755d6bde47b67edadb9a",
      },
      this.pxe as any
    );

    const account = await this.wallet.connect();
    return account.getAddress().toString();
  }

  async deployToken(name: string, symbol: string, decimals: number): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }
  
    const account = this.wallet.getAccount();
    if (!account) throw new Error("Wallet not connected");
  
    const myToken = await TokenContract.deploy(
      account,
      account.getAddress(), // admin address
      name,
      symbol,
      BigInt(decimals)
    )
      .send()
      .deployed();
  
    return myToken.address.toString();
  }

  async mintTokens(tokenAddress: string, amount: number): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const account = this.wallet.getAccount();
    if (!account) throw new Error("Wallet not connected");

    const myToken = await TokenContract.at(tokenAddress as AztecAddress, this.wallet);
    const receipt = await myToken
      .withWallet(account)
      .methods.mint_public(account.getAddress(), new Fr(amount))
      .send()
      .wait();

    return receipt.txHash.toString();
  }

  async checkBalance(tokenAddress: string): Promise<string> {
    if (!this.wallet) {
      throw new Error("Wallet not connected");
    }

    const account = this.wallet.getAccount();
    if (!account) throw new Error("Wallet not connected");

    const myToken = await TokenContract.at(tokenAddress);
    const balance = await myToken
      .withWallet(account)
      .methods.balance_of_public(account.getAddress())
      .simulate();

    return balance.toString();
  }
}

export const walletConnector = new WalletConnector();