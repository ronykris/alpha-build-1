import Image from "next/image";
import { setupSandbox } from "../utils/aztec/pxe_connect"; // Import your async function


export default async function Home() {
  try {
    const pxe = await setupSandbox();
    const registeredAccounts = await pxe.getRegisteredAccounts();
    const blockNum = await pxe.getBlockNumber();

    console.log("Registered Accounts:", registeredAccounts);
    console.log("Block Number:", blockNum);
  } catch (e) {
    console.error("Error setting up sandbox:", e);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl">Home Page</h1>
      <p>Check the console for output from the async function.</p>

      
            {/* <WalletUI/> */}

    </main>
  );
}

