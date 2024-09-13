import {
  AccountWallet,
  AztecAddress,
  CompleteAddress,
  createPXEClient,
  Fr,
  GrumpkinScalar,
  PXE,
  Wallet,
  Grumpkin,
  waitForPXE
} from '@aztec/aztec.js';
import { EcdsaKAccountwithKeyRotationContract } from '../../noir_contracts/security_options/src/artifacts/EcdsaKAccountwithKeyRotation.ts';
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";

async function setupEnvironment(): Promise<{ pxe: PXE, wallet: AccountWallet }> {
  const { PXE_URL = 'http://localhost:8080' } = process.env;
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  let wallets: AccountWallet[] = [];
  wallets = await getInitialTestAccountsWallets(pxe);
  const wallet = wallets[0];
  return { pxe, wallet };
}

async function deployContract(wallet: Wallet, signingKeyX: bigint[], signingKeyY: bigint[]): Promise<EcdsaKAccountwithKeyRotationContract> {
  const deployTx = EcdsaKAccountwithKeyRotationContract.deploy(wallet, signingKeyX, signingKeyY);
  const receipt = await deployTx.send().wait();
  return EcdsaKAccountwithKeyRotationContract.at(receipt.contract.address, wallet);
}

async function testKeyRotation(contract: EcdsaKAccountwithKeyRotationContract, wallet: Wallet) {
  console.log('Testing key rotation...');

  // Generate new key pair for rotation
  const grumpkin = new Grumpkin();
  const newSecretKey = GrumpkinScalar.random();
  const newPublicKey = grumpkin.mul(Grumpkin.generator, newSecretKey);

  const newPublicKeyX = [newPublicKey.x.toBigInt()];
  const newPublicKeyY = [newPublicKey.y.toBigInt()];

  // Perform key rotation
  const rotateTx = await contract.methods.rotate_key(newPublicKeyX, newPublicKeyY).send();
  await rotateTx.wait();
  console.log('Key rotation transaction sent');

  // Verify the key rotation (this would depend on how your contract allows verification)
  // For example, you might have a method to get the current public key
  // const currentKey = await contract.methods.getCurrentPublicKey().view();
  // console.log('New public key set:', currentKey);

  console.log('Key rotation test complete');
}

async function main() {
  try {
    const { pxe, wallet } = await setupEnvironment();

    // Generate initial signing key
    const grumpkin = new Grumpkin();
    const initialSecretKey = GrumpkinScalar.random();
    const initialPublicKey = grumpkin.mul(Grumpkin.generator, initialSecretKey);

    const initialPublicKeyX = [initialPublicKey.x.toBigInt()];
    const initialPublicKeyY = [initialPublicKey.y.toBigInt()];

    // Deploy the contract
    console.log('Deploying EcdsaKAccountwithKeyRotationContract...');
    const contract = await deployContract(wallet, initialPublicKeyX, initialPublicKeyY);
    console.log('Contract deployed at:', contract.address.toString());

    // Test key rotation
    await testKeyRotation(contract, wallet);

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main().catch(console.error);