import React, { useState, useEffect } from 'react';
import { walletConnector } from '../utils/wallet_functionality/wallet_connect_shieldswap';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ShieldSwapTx() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [mintAmount, setMintAmount] = useState(0);
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initializePXE();
  }, []);

  const initializePXE = async () => {
    try {
      await walletConnector.initializePXE();
    } catch (err) {
      setError('Failed to initialize PXE');
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      const address = await walletConnector.connectWallet('your_project_id_here');
      setWalletAddress(address);
      setConnected(true);
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const deployToken = async () => {
    try {
      const address = await walletConnector.deployToken(tokenName, tokenSymbol, tokenDecimals);
      setTokenAddress(address);
    } catch (err) {
      setError('Failed to deploy token');
      console.error(err);
    }
  };

  const mintTokens = async () => {
    try {
      await walletConnector.mintTokens(tokenAddress, mintAmount);
      checkBalance();
    } catch (err) {
      setError('Failed to mint tokens');
      console.error(err);
    }
  };

  const checkBalance = async () => {
    try {
      const balance = await walletConnector.checkBalance(tokenAddress);
      setBalance(balance);
    } catch (err) {
      setError('Failed to check balance');
      console.error(err);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>ShieldSwap Transactions</CardTitle>
        <CardDescription>Manage your ShieldSwap tokens</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500">{error}</p>}
        {!connected ? (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        ) : (
          <>
            <p>Connected: {walletAddress}</p>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="tokenName">Token Name</Label>
                <Input id="tokenName" value={tokenName} onChange={(e) => setTokenName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input id="tokenSymbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tokenDecimals">Token Decimals</Label>
                <Input id="tokenDecimals" type="number" value={tokenDecimals} onChange={(e) => setTokenDecimals(Number(e.target.value))} />
              </div>
              <Button onClick={deployToken}>Deploy Token</Button>
            </div>
            {tokenAddress && (
              <div className="space-y-4 mt-4">
                <p>Token Address: {tokenAddress}</p>
                <div>
                  <Label htmlFor="mintAmount">Mint Amount</Label>
                  <Input id="mintAmount" type="number" value={mintAmount} onChange={(e) => setMintAmount(Number(e.target.value))} />
                </div>
                <Button onClick={mintTokens}>Mint Tokens</Button>
                <Button onClick={checkBalance}>Check Balance</Button>
                {balance && <p>Balance: {balance}</p>}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}