
import { AccountWallet, CompleteAddress, ContractDeployer, createDebugLogger, Fr, PXE, waitForPXE, TxStatus, createPXEClient, getContractInstanceFromDeployParams, DebugLogger } from "@aztec/aztec.js";

export const setupSandbox = async () => {
  const PXE_URL = 'http://localhost:8080';
  console.log(`Connecting to PXE at ${PXE_URL}`);
  const pxe = createPXEClient(PXE_URL);
  try {
    await waitForPXE(pxe);
  } catch (e) {
    console.error('Failed to connect to PXE:', e);
    throw e;
  }
  return pxe;
};

(async () => { 
  try {
    console.log("Process Env");
    console.log(process.env);
    let pxe = await setupSandbox();
    let accounts = await pxe.getRegisteredAccounts();
    console.log(accounts);
    console.log(await pxe.getBlockNumber())
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === 'FetchError') {
        console.error('Network error occurred while trying to connect to PXE:', e);
      } else {
        console.error('An unexpected error occurred:', e);
      }  
    } else {
      console.error("Unknown error:", e);
    }
  }
})();
