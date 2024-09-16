import { ethers } from 'ethers';
import L1ContractJson from '../constants/L1Contract.json'

const L1_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const L1_CONTRACT_ABI = L1ContractJson.abi

interface Transaction {
  id: string | number;
  type: 'Send' | 'Receive';
  amount: string | number;
  to?: string;
  from?: string;
  timestamp: string;
  network?: 'PXE' | 'L1';
}

export const connectToL1Chain = async (chainName: string): Promise<{chainId: number, name: string, block: number, provider: ethers.BrowserProvider}> => {
  let provider;
  const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY;
  switch (chainName.toLowerCase()) {
    case 'sepolia':
      provider = new ethers.BrowserProvider(window.ethereum);
      break;
    case 'localhost':
      provider = new ethers.BrowserProvider(window.ethereum);
      break;
    // Add other chains as needed
    default:
      throw new Error('Unsupported chain');
  }
  
  const network = await provider.getNetwork();
  const blockNumber = "latest";
  const block = await provider.getBlock(blockNumber);
  return { name: network.name, chainId: Number(network.chainId), block: block?.number!, provider: provider};
};

export const fetchL1Transactions = async (provider: ethers.BrowserProvider, address: string): Promise<Transaction[]> => {
  if (!provider) {
    console.error("L1 provider is not initialized.");
    return [];
  }
  if (!address) {
    console.error("Address is not provided.");
    return [];
  }
  try {
    console.log("Fetching the latest block number...");
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);

    const transactions: Transaction[] = [];

    for (let i = blockNumber; i > blockNumber - 100 && i > 0; i--) {
      console.log(`Fetching block ${i}...`);
      const block = await provider.getBlock(i);

      console.log(`Block ${i} fetched. Number of transactions: ${block!.transactions.length}`);
      
      for (const txHash of block!.transactions) {
        console.log(`Fetching transaction details for txHash: ${txHash}`);
        const tx = await provider.getTransaction(txHash);

        if (tx!.from.toLowerCase() === address.toLowerCase() || tx!.to?.toLowerCase() === address.toLowerCase()) {
          const timestamp = block!.timestamp; 

          console.log(`Transaction found for address ${address} in block ${i}: ${tx!.hash}`);
          
          transactions.push({
            id: tx!.hash, 
            type: tx!.from.toLowerCase() === address.toLowerCase() ? 'Send' : 'Receive', 
            amount: ethers.formatEther(tx!.value),
            to: tx!.to ?? undefined,  
            from: tx!.from, 
            timestamp: new Date(timestamp * 1000).toISOString(),
            network: 'L1', 
          });
        }
      }
    }

    console.log(`Total transactions found: ${transactions.length}`);
    return transactions;
  } catch (error) {
    console.error("Error fetching L1 transactions:", error);
    return [];
  }
  
};

export async function depositToAztecPrivate(provider: ethers.BrowserProvider, amount: string) {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(L1_CONTRACT_ADDRESS, L1_CONTRACT_ABI, signer);
  const amountWei = ethers.parseEther(amount);
  const secretHashRedeem = ethers.keccak256(ethers.toUtf8Bytes('secretHashRedeem'));
  const secretHashL2Message = ethers.keccak256(ethers.toUtf8Bytes('secretHashL2Message'));

  try {
    console.log('Attempting to deposit', amount, 'ETH to Aztec');
    const tx = await contract.depositToAztecPrivate(secretHashRedeem, amountWei, secretHashL2Message, {gasLimit: 300000,});
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error('Error in depositToAztecPrivate:', error);
    throw error;
  }
}