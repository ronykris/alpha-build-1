import { PXE, createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { ShieldswapWalletSdk } from "@shieldswap/wallet-sdk";
import { TokenContract  } from "@aztec/noir-contracts.js/Token";

export class WalletConnector {
  private static pxe: PXE | null = null;
  public wallet: ShieldswapWalletSdk | null = null;

  public async setupPXE(): Promise<void> {
    const pxe = createPXEClient("http://localhost:8080");
    await waitForPXE(pxe);
    WalletConnector.pxe = pxe;
  }

  public async connectWallet(): Promise<string> {
    if (!WalletConnector.pxe) {
      throw new Error("PXE not initialized. Call setupPXE first.");
    }

    this.wallet = new ShieldswapWalletSdk(
      {
        projectId: "1a51576d0996755d6bde47b67edadb9a",
      },
      WalletConnector.pxe as any // Type assertion to bypass type mismatch
    );

    const account = await this.wallet.connect();
    return account.getAddress().toString();
  }

  getPXE(): PXE | null {
    return WalletConnector.pxe;
  }

  getWallet(): ShieldswapWalletSdk | null {
    return this.wallet;
  }
}

export const walletConnector = new WalletConnector();
