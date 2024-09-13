import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AztecAddress } from "@aztec/aztec.js";
import { deployContract, testKeyRotation, setupEnvironment } from '../utils/noir_contract_deploy/security_options';
import { AccountWallet, PXE, Grumpkin, GrumpkinScalar, Point} from '@aztec/aztec.js';
import { EcdsaKAccountwithKeyRotationContract } from '../noir_contracts/security_options/src/artifacts/EcdsaKAccountwithKeyRotation.ts';

export function EcdsaAccountKeyRotation() {
    const [pxe, setPxe] = useState<PXE | null>(null);
    const [wallet, setWallet] = useState<AccountWallet | null>(null);
    const [contractAddress, setContractAddress] = useState<AztecAddress | null>(null);
    const [currentPublicKey, setCurrentPublicKey] = useState<{ x: string, y: string } | null>(null);
    const [newPublicKey, setNewPublicKey] = useState<{ x: string, y: string } | null>(null);
    const [contract, setContract] = useState<EcdsaKAccountwithKeyRotationContract | null>(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        initializeEnvironment();
    }, []);

    const initializeEnvironment = async () => {
        try {
            setStatus('Setting up environment...');
            const { pxe: newPxe, wallet: newWallet } = await setupEnvironment();
            setPxe(newPxe);
            setWallet(newWallet);
            setStatus('Environment setup complete');
        } catch (err) {
            setError('Failed to setup environment: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleDeployContract = async () => {
        if (!wallet) {
            setError('Wallet not set up yet');
            return;
        }
        try {
            setStatus('Generating initial key pair...');
            const grumpkin = new Grumpkin();
            const initialSecretKey = GrumpkinScalar.random();
            const initialPublicKey = grumpkin.mul(Grumpkin.generator, initialSecretKey);
            
            const initialPublicKeyX = [
                initialPublicKey.x.toBigInt() >> 128n,
                initialPublicKey.x.toBigInt() & ((1n << 128n) - 1n)
            ];
            const initialPublicKeyY = [
                initialPublicKey.y.toBigInt() >> 128n,
                initialPublicKey.y.toBigInt() & ((1n << 128n) - 1n)
            ];
            
            setStatus('Deploying contract...');
            const newContract = await deployContract(wallet, initialPublicKeyX, initialPublicKeyY);
            
            setContract(newContract);
            setContractAddress(newContract.address);
            setCurrentPublicKey({
                x: initialPublicKey.x.toString(),
                y: initialPublicKey.y.toString()
            });
            setStatus('Contract deployed successfully');
        } catch (err) {
            setError('Failed to deploy contract: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const handleRotateKey = async () => {
        if (!contract || !wallet) {
            setError('Contract not deployed or wallet not set up');
            return;
        }
        try {
            setStatus('Rotating key...');
            const newPublicKeyPoint: Point = await testKeyRotation(contract, wallet);
            const newPublicKeyObj = {
                x: newPublicKeyPoint.x.toString(),
                y: newPublicKeyPoint.y.toString()
            };
            setNewPublicKey(newPublicKeyObj);
            setCurrentPublicKey(newPublicKeyObj);
            setStatus('Key rotated successfully');
        } catch (err) {
            setError('Failed to rotate key: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>ECDSA Account with Key Rotation</CardTitle>
                <CardDescription>Deploy and manage your ECDSA account with key rotation capability</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p>{wallet ? `Wallet Address: ${wallet.getAddress().toString()}` : 'Wallet not set up'}</p>
                    <Button onClick={() => handleDeployContract()} disabled={!wallet || !!contractAddress}>
                        Deploy Contract
                    </Button>
                    {contractAddress && (
                        <p>Contract Address: {contractAddress.toString()}</p>
                    )}
                    {currentPublicKey && (
                        <div>
                            <p>Current Public Key X: {currentPublicKey.x}</p>
                            <p>Current Public Key Y: {currentPublicKey.y}</p>
                        </div>
                    )}
                    <Button onClick={() => handleRotateKey()} disabled={!contract}>
                        Rotate Key
                    </Button>
                    {newPublicKey && (
                        <div>
                            <p>New Public Key X: {newPublicKey.x}</p>
                            <p>New Public Key Y: {newPublicKey.y}</p>
                        </div>
                    )}
                    {status && <p>{status}</p>}
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </CardContent>
        </Card>
    );
}