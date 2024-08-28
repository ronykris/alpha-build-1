import React, { useEffect, useState } from 'react';
import { WalletUI } from "@/components/wallet_ui";
import './App.css';
import { PXE } from '@aztec/aztec.js';

// Define the type for the initPXE function
type InitPXEFunction = () => Promise<PXE | null>;

// Define props for App component
interface AppProps {
  initPXE: InitPXEFunction;
}

function App({ initPXE }: AppProps) {
  const [pxe, setPxe] = useState<PXE | null>(null);

  useEffect(() => {
    const initializePXE = async () => {
      const initializedPXE = await initPXE();
      setPxe(initializedPXE);
    };
    initializePXE();
  }, [initPXE]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>My Wallet App</h1>
      </header>
      <div id="wallet-root">
        {pxe && <WalletUI pxe={pxe} />}
      </div>
    </div>
  );
}

export default App;