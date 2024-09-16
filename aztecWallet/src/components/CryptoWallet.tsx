import React, { useEffect, useState } from 'react';
import useWalletStore from '../utils/wallet_functionality/wallet_master';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountType, CreateAccountOptions } from '../utils/wallet_functionality/account_create';
import CustomSelect from './ui/CustomSelect';
import { connectToL1Chain, depositToAztecPrivate } from '../utils/l1Utils';
import { ethers } from 'ethers';


export function CryptoWallet() {
    const { 
      balance, 
      address, 
      l1Account,
      setL1Account,
      recipient, 
      amount, 
      //showHistory, 
      pxe,
      pxeAccounts,
      blockNumber,
      pxeError,
      //ethProvider,
      pxeTransactions, 
      l1Transactions,
      setRecipient, 
      setAmount, 
      //setShowHistory, 
      sendTransaction,
      initializePXE,
      setEthProvider,
      fetchPXETransactions,
      fetchL1Transactions,
      createAccount,
    } = useWalletStore();

    const [accountType, setAccountType] = useState<AccountType>('schnorr');
    const [accountAlias, setAccountAlias] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);

    const [transferAmount, setTransferAmount] = useState('');
    const [selectedChain, setSelectedChain] = useState('');
    const [transferDirection, setTransferDirection] = useState<'toAztec' | 'fromAztec'>('toAztec');

    const [l1ChainId, setL1ChainId] = useState<number | null>(null);
    const [l1ChainName, setL1ChainName] = useState<string | null>(null);
    const [l1ChainBlock, setL1ChainBlock] = useState<number | null>(null);
    const [l1ConnectionError, setL1ConnectionError] = useState<string | null>(null);
    const [isConnectingL1, setIsConnectingL1] = useState(false);

    const [ethProvider, setLocalEthProvider] = useState<ethers.BrowserProvider | null>(null);
    const [transferStatus, setTransferStatus] = useState<string>('');

    const [showHistory, setShowHistory] = useState(false);
    const [activeHistoryTab, setActiveHistoryTab] = useState<'PXE' | 'L1'>('PXE');
    const [isLoadingL1Transactions, setIsLoadingL1Transactions] = useState(false);

    const getConnectedAccountAddress = async () => {
      try {
        if (window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          console.log(web3Provider)
          await web3Provider.send("eth_requestAccounts", []);
          setLocalEthProvider(web3Provider);
          setEthProvider(web3Provider); 
          const signer = await web3Provider.getSigner();
          const connectedAddress = await signer.getAddress()
          console.log('Connected account address:', connectedAddress);
          setL1Account(connectedAddress);
        } else {
          console.error('No Ethereum provider detected. Please install MetaMask.');
        }
      } catch (error) {
        console.error('Failed to get connected account address:', error);
      }
    };

    useEffect(() => {
      initializePXE();

      if (window.ethereum) {
        console.log('Ethereum provider detected. Fetching connected account address...');
        getConnectedAccountAddress();
      }

      if (showHistory) {
        fetchPXETransactions();
        if (ethProvider && l1Account) {
          console.log('Fetching L1 Transactions...');
          setIsLoadingL1Transactions(true);
          fetchL1Transactions().finally(() => {
            setIsLoadingL1Transactions(false);
            console.log('Finished fetching L1 transactions.');
          });
        } else {
          console.error('ethProvider or address is not initialized. Cannot fetch L1 transactions.');
        }        
      }
    }, [showHistory, l1Account, initializePXE, fetchPXETransactions, fetchL1Transactions]);

    const handleChainSelect = async (chain: string) => {
      setSelectedChain(chain);
      setIsConnectingL1(true);
      setL1ChainId(null);
      setL1ChainName(null);
      setL1ChainBlock(null);
      setL1ConnectionError(null);
      //setEthProvider(null);

      try {
        const { chainId, name, block, provider } = await connectToL1Chain(chain);
        //console.log(provider)
        setL1ChainId(chainId);
        setL1ChainName(name);
        setL1ChainBlock(block);        
        //setEthProvider(ethProvider);
        await fetchL1Transactions();
      } catch (error) {
        console.error('Failed to connect to L1 chain:', error);
        setL1ConnectionError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsConnectingL1(false);
      }
    };

    const handleCreateAccount = async () => {
      setCreatingAccount(true);
      try {
        const result = await createAccount({
          accountType,
          alias: accountAlias,
        });
        if (result) {
          alert(`Account created successfully! Address: ${result.address}`);
        }
      } catch (error) {
        console.error('Error creating account:', error);
        alert('Failed to create account. Please try again.');
      } finally {
        setCreatingAccount(false);
      }
    };

    const handleAccountTypeChange = (value: string) => {
      setAccountType(value as AccountType);
    };

    const handleAztecEthereumTransfer = async () => {
      if (transferDirection !== 'toAztec' || !ethProvider) {
        setTransferStatus('Invalid transfer configuration');
        return;
      }

      setTransferStatus('Initiating transfer...');
      try {
        setTransferStatus('Sending transaction...');
        const txHash = await depositToAztecPrivate(ethProvider, transferAmount);
        setTransferStatus(`Transaction sent. Hash: ${txHash}`);
        setTransferStatus('Waiting for confirmation...');
        const receipt = await ethProvider.waitForTransaction(txHash);
        setTransferStatus(`Transfer successful. Confirmed in block: ${receipt!.blockNumber}`);
        //setTransferStatus(`Transfer successful. Transaction hash: ${txHash}`);
      } catch (error) {
        setTransferStatus(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    const renderTransactionHistory = () => {
      return (
        <div>
          <Tabs value={activeHistoryTab} onValueChange={(value) => setActiveHistoryTab(value as 'PXE' | 'L1')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="PXE">PXE Transactions</TabsTrigger> 
              <TabsTrigger value="L1">L1 Transactions</TabsTrigger>   
            </TabsList>
            <TabsContent value="PXE"> 
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {pxeTransactions.length > 0 ? (
                  pxeTransactions.map((tx) => (
                    <div key={tx.id} className="mb-2 p-2 border rounded">
                      <p>{tx.type}: {tx.amount} ETH</p>
                      <p>To/From: {tx.to || tx.from}</p>
                      <p>Date: {new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No PXE transactions found.</p>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="L1"> 
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                {isLoadingL1Transactions ? (
                  <p>Loading L1 transactions...</p> 
                ) : l1Transactions.length > 0 ? (
                  l1Transactions.map((tx) => (
                    <div key={tx.id} className="mb-2 p-2 border rounded">
                      <p>{tx.type}: {tx.amount} ETH</p>
                      <p>To/From: {tx.to || tx.from}</p>
                      <p>Date: {new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No L1 transactions found.</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      );
    };

    return (
      <Card className="w-[350px] bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle>My Crypto Wallet</CardTitle>
          <CardDescription>Manage your crypto assets</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <Label htmlFor="balance" className="text-sm font-medium text-gray-600">Balance</Label>
            <div className="text-3xl font-bold text-blue-600" id="balance">{balance.toFixed(4)} ETH</div>
          </div>
          <div className="mb-6">
            <Label htmlFor="address" className="text-sm font-medium text-gray-600">Wallet Address</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input id="address" value={address} readOnly className="bg-gray-50" />
              <Button className="px-2 py-1 text-sm" onClick={() => {
                navigator.clipboard.writeText(address);
                alert('Address copied!');
              }}>
                Copy
              </Button>
            </div>
          </div>
          {!showHistory ? renderTransactionHistory() : (
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
                <TabsTrigger value="create">Create</TabsTrigger>
                <TabsTrigger value="aztec">Bridge</TabsTrigger>
              </TabsList>
              <TabsContent value="send">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input 
                    id="recipient" 
                    placeholder="0x..." 
                    value={recipient} 
                    onChange={(e) => setRecipient(e.target.value)} 
                  />
                  <Label htmlFor="amount">Amount (ETH)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                  />
                  <Button className="w-full mt-2" onClick={sendTransaction}>
                    Send
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="receive">
                <div className="space-y-2">
                  <p>Your receiving address:</p>
                  <Input value={address} readOnly />
                  <Button className="w-full mt-2">
                    Request Payment
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="create">
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select onValueChange={handleAccountTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schnorr">Schnorr</SelectItem>
                      <SelectItem value="ecdsasecp256r1ssh">ECDSA secp256r1 SSH</SelectItem>
                      <SelectItem value="ecdsasecp256k1">ECDSA secp256k1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="accountAlias">Account Alias (Optional)</Label>
                  <Input 
                    id="accountAlias" 
                    placeholder="Enter alias" 
                    value={accountAlias} 
                    onChange={(e) => setAccountAlias(e.target.value)} 
                  />
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleCreateAccount}
                    disabled={creatingAccount}
                  >
                    {creatingAccount ? 'Creating...' : 'Create Account'}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="aztec">
                <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferDirection">Transfer Direction</Label>
                  <CustomSelect
                    options={[
                      { value: 'toAztec', label: 'To Aztec' },
                      { value: 'fromAztec', label: 'From Aztec' }
                    ]}
                    placeholder="Select direction"
                    onChange={(value) => setTransferDirection(value as 'toAztec' | 'fromAztec')}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="chainSelect">EVM Chain</Label>
                  <CustomSelect
                    options={[
                      { value: 'ethereum', label: 'Ethereum Mainnet' },
                      { value: 'goerli', label: 'Goerli Testnet' },
                      { value: 'sepolia', label: 'Sepolia Testnet' },
                      { value: 'polygon', label: 'Polygon' },
                      { value: 'localhost', label: 'Localhost (Test)' },
                    ]}
                    placeholder="Select EVM Chain"
                    onChange={handleChainSelect}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount</Label>
                  <Input 
                    id="transferAmount" 
                    type="number" 
                    placeholder="0.00" 
                    value={transferAmount} 
                    onChange={(e) => setTransferAmount(e.target.value)} 
                  />
                  </div>
                  
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleAztecEthereumTransfer}
                    disabled={!selectedChain || !transferAmount || transferDirection !== 'toAztec' || !ethProvider}
                  >
                    Transfer {transferDirection === 'toAztec' ? 'to' : 'from'} Aztec
                  </Button>
                  {transferStatus && (
                    <div className="mt-2 text-sm text-gray-600">
                      {transferStatus}
                    </div>
                    )}
                  {selectedChain === 'localhost' && (
                    <div className="mt-2 text-sm text-yellow-600">
                      Warning: You are connected to a local test chain. This is for testing purposes only.
                    </div>
                  )}              
                </div>
              </TabsContent>
            </Tabs>
          ) }

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Connection Status</h3>
            <div className="mt-2">
              <h4 className="text-base font-semibold">Aztec Connection</h4>
            {pxe ? (
              <div>
                 <p className="text-green-600">Connected to Aztec</p>
                <p>Accounts: {pxeAccounts.length}</p>
                <p>Block Number: {blockNumber}</p>
              </div>
            ) : pxeError ? (
              <p className="text-red-500">Error: {pxeError}</p>
            ) : (
              <Button onClick={initializePXE}>Connect to Aztec</Button>
            )}
          </div>
            <div className="mt-2">
              <h4 className="text-base font-semibold">L1 Chain Connection</h4>
              {isConnectingL1 ? (
                <p className="text-yellow-500">Connecting to L1 Chain...</p>
              ) : l1ChainId && l1ChainName ? (
                <>
                <p className="text-green-600">Connected to {l1ChainName}</p>
                <p>Chain ID: {l1ChainId}</p>
                <p>Block Number: {l1ChainBlock}</p>
                {selectedChain === 'localhost' && (
                  <p className="text-yellow-600">This is a local test chain</p>
                )}
                </>
              ) : l1ConnectionError ? (
                <p className="text-red-500">L1 Connection Error: {l1ConnectionError}</p>
              ) : (
                <p className="text-gray-500">No L1 Chain selected</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-200">
          <Button className="w-full" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'View' : 'Hide'} Transaction History
          </Button>
        </CardFooter>
      </Card>
    );
  }