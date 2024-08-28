import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { WalletUI } from "@/components/wallet_ui"; // Ensure the import path is correct

function App() {
  const [count, setCount] = useState(0);

  // Effect to initialize wallet functionality (optional, based on your architecture)
  useEffect(() => {
    // You can perform any wallet initialization here if needed
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* Add the wallet UI container */}
      <div id="wallet-root">
        <WalletUI /> {/* Render WalletUI directly if needed */}
      </div>
    </>
  );
}

export default App;
