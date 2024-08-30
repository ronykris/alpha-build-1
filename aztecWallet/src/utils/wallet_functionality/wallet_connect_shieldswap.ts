import {ShieldswapWalletSdk} from "@shieldswap/wallet-sdk";
import { createPXEClient , waitForPXE  } from "@aztec/aztec.js";

const pxe  = createPXEClient ("http://localhost:8080");
await waitForPXE (pxe );

const wallet  = new ShieldswapWalletSdk (
  {
    projectId : "1a51576d0996755d6bde47b67edadb9a",
  },
  pxe ,
);

// Connect to a wallet over WalletConnect
// opens WalletConnect modal. User can choose which wallet to connect to
const account  = await wallet .connect ();
console .log ("connected wallet", account .getAddress ().toString());