import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers, type ContractTransactionResponse } from 'ethers';
import { useWallet } from './useWallet';
import { PRESALE_TOKEN_ADDRESS, PRESALE_ABI, FITOCHAIN_NETWORK } from '../constants';

// Define a simple state for transactions
interface TxState {
    loading: boolean;
    error: string | null;
    hash: string | null;
}

const initialTxState: TxState = { loading: false, error: null, hash: null };

// Define an interface with our contract's specific methods for type awareness.
interface PresaleContractMethods {
    paused: () => Promise<boolean>;
    forceActive: () => Promise<boolean>;
    totalWeiRaised: () => Promise<bigint>;
    participantCount: () => Promise<bigint>;
    buyTokens: (referrer: string, options: { value: ethers.BigNumberish }) => Promise<ContractTransactionResponse>;
    pause: () => Promise<ContractTransactionResponse>;
    unpause: () => Promise<ContractTransactionResponse>;
    setForceActive: (shouldForce: boolean) => Promise<ContractTransactionResponse>;
}

// Create a fully typed contract by intersecting the base Contract type with our methods.
type PresaleContract = ethers.Contract & PresaleContractMethods;

export const usePresaleContract = () => {
    const { account, chainId } = useWallet();
    const [contract, setContract] = useState<PresaleContract | null>(null);

    // On-chain state
    const [isPaused, setIsPaused] = useState(false);
    const [isForceActive, setIsForceActive] = useState(false);
    const [raisedAmountEth, setRaisedAmountEth] = useState(0);
    const [participants, setParticipants] = useState(0);

    // Status states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tx, setTx] = useState<TxState>(initialTxState);

    // Memoize the provider so it's not recreated on every render
    const provider = useMemo(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            return new ethers.BrowserProvider(window.ethereum);
        }
        return new ethers.JsonRpcProvider(FITOCHAIN_NETWORK.rpc[0]);
    }, []);

    const fetchContractData = useCallback(async (currentContract: PresaleContract) => {
        setIsLoading(true);
        try {
            const [paused, forceActive, totalWei, participantCount] = await Promise.all([
                currentContract.paused(),
                currentContract.forceActive(),
                currentContract.totalWeiRaised(),
                currentContract.participantCount()
            ]);
            setIsPaused(paused);
            setIsForceActive(forceActive);
            setRaisedAmountEth(parseFloat(ethers.formatEther(totalWei)));
            setParticipants(Number(participantCount));
            setError(null);
        } catch (err: any) {
            console.error("Error fetching contract data:", err);
            setError("Failed to load presale data. Ensure the contract address is correct and you are on the right network.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect to initialize contract and fetch data periodically
    useEffect(() => {
        // Configuration check to prevent errors with placeholder address
        if (PRESALE_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000" || PRESALE_TOKEN_ADDRESS === "0x1234567890123456789012345678901234567890") {
            setError("Configuration Error: You must update the PRESALE_TOKEN_ADDRESS in 'constants.ts' with your deployed contract address.");
            setIsLoading(false);
            return; // Halt execution if the address is not configured
        }

        const presaleContract = new ethers.Contract(PRESALE_TOKEN_ADDRESS, PRESALE_ABI, provider) as PresaleContract;
        setContract(presaleContract);

        const fetchData = () => fetchContractData(presaleContract);

        fetchData(); // Initial fetch

        const intervalId = setInterval(fetchData, 15000); // Refresh every 15 seconds
        return () => clearInterval(intervalId);
    }, [provider, fetchContractData]);

    const getSigner = async () => {
        if (!window.ethereum) throw new Error("Wallet not found");
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        return browserProvider.getSigner();
    };
    
    const handleTransaction = async (txPromise: Promise<ethers.ContractTransactionResponse>) => {
        setTx({ loading: true, error: null, hash: null });
        try {
            const transaction = await txPromise;
            setTx(prev => ({ ...prev, hash: transaction.hash }));
            await transaction.wait();
            setTx({ loading: false, error: null, hash: transaction.hash });
            if (contract) { // Ensure contract is not null
                 await fetchContractData(contract); // Refresh data after tx is mined
            }
        } catch (err: any) {
             console.error("Transaction Error:", err);
            const errorMessage = err.reason || (err.code === 'ACTION_REJECTED' ? 'Transaction rejected by user' : 'Transaction failed');
            setTx({ loading: false, error: errorMessage, hash: null });
            throw err; // Re-throw to be caught by the calling function if needed
        }
    };
    
    // --- Public Functions ---
    const buyTokens = async (ethAmount: string, referrer: string) => {
        if (!contract || !account || chainId !== FITOCHAIN_NETWORK.chainId) {
            setTx({ loading: false, error: "Cannot transact. Check wallet connection and network.", hash: null });
            return;
        }
        try {
            const signer = await getSigner();
            const value = ethers.parseEther(ethAmount);
            // Explicitly cast the connected contract to our typed interface
            const connectedContract = contract.connect(signer) as PresaleContract;
            await handleTransaction(connectedContract.buyTokens(referrer, { value }));
        } catch (err) {
            // Error is already set by handleTransaction
        }
    };

    // --- Admin Functions ---
    const setPause = async (shouldPause: boolean) => {
        if (!contract || !account || chainId !== FITOCHAIN_NETWORK.chainId) return;
        try {
            const signer = await getSigner();
             // Explicitly cast the connected contract to our typed interface
            const connectedContract = contract.connect(signer) as PresaleContract;
            const txPromise = shouldPause ? connectedContract.pause() : connectedContract.unpause();
            await handleTransaction(txPromise);
        } catch (err) {
            // Error handled
        }
    };
    
    const setForceActivate = async (shouldForce: boolean) => {
        if (!contract || !account || chainId !== FITOCHAIN_NETWORK.chainId) return;
        try {
            const signer = await getSigner();
             // Explicitly cast the connected contract to our typed interface
            const connectedContract = contract.connect(signer) as PresaleContract;
            await handleTransaction(connectedContract.setForceActive(shouldForce));
        } catch (err) {
            // Error handled
        }
    };

    return {
        isPaused,
        isForceActive,
        raisedAmountEth,
        participants,
        isLoading,
        error,
        tx,
        buyTokens,
        setPause,
        setForceActivate,
    };
};
