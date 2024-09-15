import { PXE, createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { JsonRpcProvider } from 'ethers';

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
/*
export const connectToL1Chain = async (pxe: PXE) => {
  const { l1ChainId } = await pxe.getNodeInfo();
  return l1ChainId
}*/
export const connectToL1Chain = async (chainName: string): Promise<{chainId: number, name: string, block: number}> => {
  let provider;
  const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY;
  switch (chainName.toLowerCase()) {
    case 'sepolia':
      provider = new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`);      
      break;
    // Add other chains as needed
    default:
      throw new Error('Unsupported chain');
  }
  const network = await provider.getNetwork();
  const blockNumber = "latest";
  const block = await provider.getBlock(blockNumber);
  //console.log(block);
  return { name: network.name, chainId: Number(network.chainId), block: block?.number! };
};