import React from 'react';
import { CryptoWallet } from './components/CryptoWallet';
import {ConnectDAppShieldSwap} from './components/ConnectShieldSwap'
//import "./App.css"

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Aztec Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your crypto assets with ease</p>
      </header>
      <main>
        <CryptoWallet/>
        <ConnectDAppShieldSwap/>
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        &copy; 2024 Aztec Wallet. All rights reserved.
      </footer>
    </div>
  );
}

export default App;