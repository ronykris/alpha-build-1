import {
    createPXEClient,
    waitForPXE,
    type Wallet,
    AccountWallet,
    AccountManager,
    type PXE,
    type AccountContract,
    type CompleteAddress
  } from '@aztec/aztec.js';
import { Fr, GrumpkinScalar } from '@aztec/foundation/fields';
import { randomBytes } from '@aztec/foundation/crypto';
import { EcdsaKAccountwithKeyRotationContract } from '../../noir_contracts/security_options/src/artifacts/EcdsaKAccountwithKeyRotation.ts';
import { deriveSigningKey } from '@aztec/circuits.js/keys';
import { ChildContract } from '@aztec/noir-contracts.js/Child';

class WalletConnector{
    static pxe: PXE;
    static async setupPXE(): Promise<PXE>{
        const pxe = createPXEClient("http://localhost:8080");
        await waitForPXE(pxe);
        WalletConnector.pxe = pxe;
        return pxe;
        console.log("PXE setup complete");
    }
}


  

export async function main(){
    let child: ChildContract;
    let wallet: Wallet;
    let secretKey: Fr;
    let pxe: PXE;
    pxe = await WalletConnector.setupPXE();

    

    const walletSetup = async (pxe: PXE, secretKey: Fr, accountContract: AccountContract) => {
        const account = new AccountManager(pxe, secretKey, accountContract);
        return await account.waitSetup();
    };

    const walletAt = async (pxe: PXE, accountContract: AccountContract, address: CompleteAddress) => {
        const nodeInfo = await pxe.getNodeInfo();
        const entrypoint = accountContract.getInterface(address, nodeInfo);
        return new AccountWallet(pxe, entrypoint);
    };


    try {
        // Generate a secret key and derive the signing key
        secretKey = Fr.random();
        const signingKey = deriveSigningKey(secretKey);
        console.log('Signing key created');

        // Set up the wallet
        const accountContract = new EcdsaKAccountwithKeyRotationContract(signingKey);
        wallet = await walletSetup(pxe, secretKey, EcdsaKAccountwithKeyRotationContract());
        console.log('Wallet setup complete. Address:', wallet.getAddress().toString());
    
        // Example: Deploy a Child contract using the new wallet
        child = await ChildContract.deploy(wallet).send().deployed();
        console.log('Child contract deployed at:', child.address.toString());
    
        // Example: Retrieve the wallet using walletAt
        const retrievedWallet = await walletAt(pxe, accountContract, wallet.getCompleteAddress());
        console.log('Retrieved wallet address:', retrievedWallet.getAddress().toString());
    
        // You can add more interactions or tests here, such as key rotation
        
        console.log('Setup and deployment complete');
      } catch (error) {
        console.error('An error occurred:', error);
      }
   
}