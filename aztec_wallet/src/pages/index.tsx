import Image from "next/image";
import { setupSandbox } from "../utils/aztec/pxe_connect";
import { useEffect, useState } from "react";


export default function Home() {
  const [registeredAccounts, setRegisteredAccounts] = useState(null);
  const [blockNum, setBlockNum] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() =>{
    const fetchData = async () => {
      try {
        const pxe = await setupSandbox();
        const registeredAccounts = await pxe.getRegisteredAccounts();
        const blockNum = await pxe.getBlockNumber();
        setRegisteredAccounts(registeredAccounts)
        setBlockNum(blockNum)
      } catch (e) {
        setError(e.message);
        console.error("Error setting up sandbox:", e);
      }
    }
    fetchData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl">Home Page</h1>
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

