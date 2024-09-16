import { create } from 'zustand';
import { CompleteAddress, PXE } from '@aztec/aztec.js';
import { setupSandbox, getAccounts, getBlockNumber, fetchPXETransactions } from '../pxeUtils';
import { addAccountIntegrationToStore, CreateAccountOptions, AccountCreationResult } from './account_create';
import { ethers } from 'ethers';
import { fetchL1Transactions } from '../l1Utils';

interface Transaction {
  id: string | number;
  type: 'Send' | 'Receive';
  amount: string | number;
  to?: string;
  from?: string;
  timestamp: string;
  network?: 'PXE' | 'L1';
}

interface WalletState {
  balance: number;
  address: string;
  l1Account: string | null;
  setL1Account: (l1Account: string) => void;
  //transactions: Transaction[];
  recipient: string;
  amount: string;
  showHistory: boolean;
  pxe: PXE | null;
  pxeAccounts: CompleteAddress[];
  blockNumber: number | null;
  pxeError: string | null;
  ethProvider: ethers.BrowserProvider | null;
  pxeTransactions: Transaction[];  
  l1Transactions: Transaction[];
  setRecipient: (recipient: string) => void;
  setAmount: (amount: string) => void;
  setShowHistory: (showHistory: boolean) => void;
  sendTransaction: () => void;
  initializePXE: () => Promise<void>;
  fetchPXETransactions: () => Promise<void>;
  fetchL1Transactions: () => Promise<void>;
  createAccount: (options: CreateAccountOptions) => Promise<AccountCreationResult | null>;
  setEthProvider: (provider: ethers.BrowserProvider) => void;
}

const useWalletStore = create<WalletState>((set, get) => ({
  balance: 1.23453,
  address: '0x1234...5678',
  l1Account: '',
  setL1Account: (l1Account) => set({ l1Account }),
  /*transactions: [
    { id: 1, type: 'Send', amount: 0.1, to: '0xabcd...efgh', timestamp: new Date().toISOString() },
    { id: 2, type: 'Receive', amount: 0.2, from: '0x9876...5432', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],*/
  recipient: '',
  amount: '',
  showHistory: false,
  pxe: null,
  pxeAccounts: [],
  blockNumber: null,
  pxeError: null,
  ethProvider: null,
  pxeTransactions: [],  
  l1Transactions: [],
  setRecipient: (recipient) => set({ recipient }),
  setAmount: (amount) => set({ amount }),
  setShowHistory: (showHistory) => set({ showHistory }),
  //setEthProvider: (provider) => set({ ethProvider: provider }),
  setEthProvider: (provider: ethers.BrowserProvider) => {
    set({ ethProvider: provider });
    console.log('Provider set in Zustand store:', provider);
  },
  sendTransaction: () => set((state: { recipient: any; amount: string; balance: number; pxeTransactions: any; }) => {
    if (state.recipient && state.amount) {
      const newTransaction: Transaction = {
        id: Date.now(),
        type: 'Send',
        amount: parseFloat(state.amount),
        to: state.recipient,
        timestamp: new Date().toISOString(),
        network: 'PXE'
      };
      return {
        balance: state.balance - parseFloat(state.amount),
        transactions: [newTransaction, ...state.pxeTransactions],
        recipient: '',
        amount: ''
      };
    }
    return state;
  }),
  initializePXE: async () => {
    try {
      const pxe = await setupSandbox();
      const accounts = await getAccounts(pxe);
      const blockNumber = await getBlockNumber(pxe);
      set({ pxe, pxeAccounts: accounts, blockNumber, pxeError: null });
    } catch (error) {
      console.error('Failed to initialize PXE:', error);
      set({ pxeError: error instanceof Error ? error.message : 'Unknown error' });
    } 
  },
  fetchPXETransactions: async () => {
    try {
      const pxeTransactions = await fetchPXETransactions();
      set({ pxeTransactions });  
      console.log(pxeTransactions)
    } catch (error) {
      console.error("Error fetching PXE transactions:", error);
    }
  },
  fetchL1Transactions: async () => {
    const { ethProvider, l1Account } = get();
    console.log(ethProvider)
    console.log(l1Account)
    if (!ethProvider || !l1Account) {
      console.error("Error getting eth provider / address")
      return;
    }
  
    try {
      console.log("Fetching L1 transactions")
      const transactions = await fetchL1Transactions(ethProvider, l1Account);
      set({ l1Transactions: transactions });
    } catch (error) {
      console.error("Error fetching L1 transactions:", error);
    }
  },
  ...addAccountIntegrationToStore(set, get),
}));

export default useWalletStore;