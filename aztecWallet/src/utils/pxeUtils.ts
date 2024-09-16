import { PXE, createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { JsonRpcProvider } from 'ethers';

interface Transaction {
  id: string | number;
  type: 'Send' | 'Receive';
  amount: string | number;
  to?: string;
  from?: string;
  timestamp: string;
  network?: 'PXE' | 'L1';
}

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

export const fetchPXETransactions = async (): Promise<Transaction[]> => {
  // Mock PXE Transactions
  const mockPXETransactions: Transaction[] = [
    { id: '1', type: 'Send', amount: '0.1', to: '0xabcd...', timestamp: new Date().toISOString(), network: 'PXE' },
    { id: '2', type: 'Receive', amount: '0.2', from: '0x1234...', timestamp: new Date(Date.now() - 86400000).toISOString(), network: 'PXE' },
  ];

  // Simulating an asynchronous fetch operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPXETransactions);
    }, 500);
  });
};
/*
export const connectToL1Chain = async (pxe: PXE) => {
  const { l1ChainId } = await pxe.getNodeInfo();
  return l1ChainId
}*/
/*
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
};*/