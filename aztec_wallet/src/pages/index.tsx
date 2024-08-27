import Image from "next/image";
import { setupSandbox } from "../utils/aztec/pxe_connect";
import { useEffect, useState } from "react";
import { WalletUI } from "../components/WalletUi"

type CompleteAddress = any;

export default function Home() {
  const [registeredAccounts, setRegisteredAccounts] = useState<CompleteAddress[] | null>(null);
  const [blockNum, setBlockNum] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() =>{
    const fetchData = async () => {
      try {
        const pxe = await setupSandbox();
        const registeredAccounts = await pxe.getRegisteredAccounts();
        const blockNum = await pxe.getBlockNumber();
        setRegisteredAccounts(registeredAccounts)
        setBlockNum(blockNum)
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
          console.error("Error setting up sandbox:", e);
        } else {
          console.error("Unknown error:", e);
        }
      }
    }
    fetchData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl">Home Page</h1>
      <WalletUI />
      {/*
      {error && <p>Error: {error}</p>}
      {!error && registeredAccounts && blockNum && (
        <>
          <p>Registered Accounts: {JSON.stringify(registeredAccounts)}</p>
          <p>Block Number: {blockNum}</p>          
        </>
      )}
      {!error && (!registeredAccounts || !blockNum) && <p>Loading...</p>}
            {/* <WalletUI/> */}
      
    </main>
  );
}

