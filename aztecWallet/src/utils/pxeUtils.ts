import { PXE, createPXEClient, waitForPXE } from "@aztec/aztec.js";

export const setupSandbox = async (): Promise<PXE> => {
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

export const getAccounts = async (pxe: PXE) => {
  return await pxe.getRegisteredAccounts();
};

export const getBlockNumber = async (pxe: PXE) => {
  return await pxe.getBlockNumber();
};