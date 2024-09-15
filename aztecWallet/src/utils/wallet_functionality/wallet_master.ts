import { create } from 'zustand';
import { CompleteAddress, PXE } from '@aztec/aztec.js';
import { setupSandbox, getAccounts, getBlockNumber } from '../pxeUtils';
import { addAccountIntegrationToStore, CreateAccountOptions, AccountCreationResult } from './account_create';

interface Transaction {
  id: number;
  type: 'Send' | 'Receive';
  amount: number;
  to?: string;
  from?: string;
  timestamp: string;
}

interface WalletState {
  balance: number;
  address: string;
  transactions: Transaction[];
  recipient: string;
  amount: string;
  showHistory: boolean;
  pxe: PXE | null;
  pxeAccounts: CompleteAddress[];
  blockNumber: number | null;
  pxeError: string | null;
  setRecipient: (recipient: string) => void;
  setAmount: (amount: string) => void;
  setShowHistory: (showHistory: boolean) => void;
  sendTransaction: () => void;
  initializePXE: () => Promise<void>;
  createAccount: (options: CreateAccountOptions) => Promise<AccountCreationResult | null>;
}

const useWalletStore = create<WalletState>((set, get) => ({
  balance: 1.23453,
  address: '0x1234...5678',
  transactions: [
    { id: 1, type: 'Send', amount: 0.1, to: '0xabcd...efgh', timestamp: new Date().toISOString() },
    { id: 2, type: 'Receive', amount: 0.2, from: '0x9876...5432', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
  recipient: '',
  amount: '',
  showHistory: false,
  pxe: null,
  pxeAccounts: [],
  blockNumber: null,
  pxeError: null,
  setRecipient: (recipient) => set({ recipient }),
  setAmount: (amount) => set({ amount }),
  setShowHistory: (showHistory) => set({ showHistory }),
  sendTransaction: () => set((state) => {
    if (state.recipient && state.amount) {
      const newTransaction: Transaction = {
        id: Date.now(),
        type: 'Send',
        amount: parseFloat(state.amount),
        to: state.recipient,
        timestamp: new Date().toISOString()
      };
      return {
        balance: state.balance - parseFloat(state.amount),
        transactions: [newTransaction, ...state.transactions],
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
  ...addAccountIntegrationToStore(set, get),
}));

export default useWalletStore;