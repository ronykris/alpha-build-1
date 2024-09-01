import { PXE, createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { ShieldswapWalletSdk } from "@shieldswap/wallet-sdk";

export class WalletConnector {
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
        projectId: projectId,
      },
      this.pxe
    );

    const account = await this.wallet.connect();
    return account.getAddress().toString();
  }

  getPXE(): PXE | null {
    return this.pxe;
  }

  getWallet(): ShieldswapWalletSdk | null {
    return this.wallet;
  }
}

export const walletConnector = new WalletConnector();