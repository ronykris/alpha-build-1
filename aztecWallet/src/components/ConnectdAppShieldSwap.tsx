import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { walletConnector } from '../utils/wallet_functionality/wallet_connect_shieldswap';

export function ConnectDAppShieldSwap() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setupPXE();
  }, []);

  const setupPXE = async () => {
    try {
      await walletConnector.setupPXE();
    } catch (err) {
      setError("Failed to setup PXE. Please check your connection.");
      console.error(err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const address = await walletConnector.connectWallet("your WalletConnect project ID");
      setWalletAddress(address);
      console.log("Connected wallet", address);
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Connect to Aztec Wallet</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {walletAddress ? (
        <div>
          <p className="mb-2">Connected Wallet Address:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{walletAddress}</p>
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}