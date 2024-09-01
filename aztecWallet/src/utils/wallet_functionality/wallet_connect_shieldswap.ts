import { PXE, createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { ShieldswapWalletSdk } from "@shieldswap/wallet-sdk";

export class WalletConnector {
  private pxe: PXE | null = null;
  private wallet: ShieldswapWalletSdk | null = null;

  async setupPXE(): Promise<void> {
    const pxe = createPXEClient("http://localhost:8080");
    await waitForPXE(pxe);
    this.pxe = pxe;
  }

  async connectWallet(projectId: string): Promise<string> {
    if (!this.pxe) {
      throw new Error("PXE not initialized. Call setupPXE first.");
    }

    this.wallet = new ShieldswapWalletSdk(
      {
        projectId: "1a51576d0996755d6bde47b67edadb9a",
      },
      this.pxe as any // Type assertion to bypass type mismatch
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

