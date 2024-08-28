// import './style.css';
import { createPXEClient, waitForPXE } from "@aztec/aztec.js"; 
import { WalletUI } from "@/components/wallet_ui";
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'

const setupSandbox = async () => {
  const PXE_URL = 'http://localhost:8080';
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
};

const initPXE = async () => {
  try {
    console.log(process.env);
    let pxe = await setupSandbox();
    let accounts = await pxe.getRegisteredAccounts();
    console.log(accounts);
    console.log(await pxe.getBlockNumber());

    // Render the WalletUI component using createRoot
    const walletContainer = document.getElementById('wallet-root');
    if (walletContainer) {
      const root = ReactDOM.createRoot(walletContainer); // Create a root
      root.render(<WalletUI />); // Render the component
    } else {
      console.error('wallet-root not found in the DOM');
    }

  } catch (e) {
    console.error('Error initializing PXE:', e);
  }
};

// Start the PXE initialization
initPXE();
