import React, { useState, useEffect } from 'react';
import { walletConnector } from '../utils/wallet_functionality/wallet_connect_shieldswap';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fr, AztecAddress } from "@aztec/aztec.js";
import { TokenContract } from "@aztec/noir-contracts.js/Token";

export function ShieldSwapTx() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState<AztecAddress | null>(null);
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
      await walletConnector.setupPXE();
    } catch (err) {
      setError('Failed to initialize PXE');
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      const address = await walletConnector.connectWallet();
      setWalletAddress(address);
      setConnected(true);
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  const deployToken = async () => {
    try {
      const wallet = walletConnector.getWallet();
      if (!wallet) throw new Error("Wallet not connected");

      const account = wallet.getAccount();
      
      if (!account) throw new Error("Account not found");

      const myToken = await TokenContract.deploy(account, account.getAddress(), tokenName, tokenSymbol, tokenDecimals)
        .send()
        .deployed();

      setTokenAddress(myToken.address);
      setError('');
    } catch (err) {
      setError('Failed to deploy token');
      console.error(err);
    }
  };

  const mintTokens = async () => {
    try {
      const wallet = walletConnector.getWallet();
      if (!wallet) throw new Error("Wallet not connected");

      const account = wallet.getAccount();
      if (!account) throw new Error("Account not found");
      if (!tokenAddress) throw new Error("Token not deployed");

      const myToken = await TokenContract.at(tokenAddress, account);

      const receipt = await myToken
        .withWallet(account)
        .methods.mint_public(account.getAddress(), new Fr(mintAmount))
        .send()
        .wait();

      console.log("Minted tokens. Tx hash:", receipt.txHash.toString());
      setError('');
      await updateBalance();
    } catch (err) {
      setError('Failed to mint tokens');
      console.error(err);
    }
  };

  const updateBalance = async () => {
    try {
      const wallet = walletConnector.getWallet();
      if (!wallet) throw new Error("Wallet not connected");

      const account = wallet.getAccount();
      if (!account) throw new Error("Account not found");

      if (!tokenAddress) throw new Error("Token not deployed");

      const myToken = await TokenContract.at(tokenAddress, account);

      const balance = await myToken
        .withWallet(account)
        .methods.balance_of_public(account.getAddress())
        .simulate();

      setBalance(balance.toString());
      setError('');
    } catch (err) {
      setError('Failed to fetch balance');
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ShieldSwap Transaction</CardTitle>
        <CardDescription>Deploy tokens and manage your wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Button onClick={connectWallet} disabled={connected}>
              {connected ? 'Connected' : 'Connect Wallet'}
            </Button>
            {walletAddress && <p>Wallet Address: {walletAddress}</p>}
          </div>
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
          <Button onClick={deployToken} disabled={!connected}>Deploy Token</Button>
          {tokenAddress && <p>Token Address: {tokenAddress.toString()}</p>}
          <div>
            <Label htmlFor="mintAmount">Mint Amount</Label>
            <Input id="mintAmount" type="number" value={mintAmount} onChange={(e) => setMintAmount(Number(e.target.value))} />
          </div>
          <Button onClick={mintTokens} disabled={!connected || !tokenAddress}>Mint Tokens</Button>
          <Button onClick={updateBalance} disabled={!connected || !tokenAddress}>Update Balance</Button>
          {balance && <p>Current Balance: {balance}</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}