
import { AccountWallet, CompleteAddress, ContractDeployer, createDebugLogger, Fr, PXE, waitForPXE, TxStatus, createPXEClient, getContractInstanceFromDeployParams, DebugLogger } from "@aztec/aztec.js";


const setupSandbox = async () => {
  const PXE_URL = 'http://localhost:8080';
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
};

(async () => {  // Wrapping the code inside an async IIFE (Immediately Invoked Function Expression)
  try {
    console.log("Process Env");
    console.log(process.env);
    let pxe = await setupSandbox();
    let accounts = await pxe.getRegisteredAccounts();
    console.log(accounts);
    console.log(await pxe.getBlockNumber());
  } catch (e) {
    console.log(e);
  }
})();
