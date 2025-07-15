import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PresaleProgress from './PresaleProgress';
import CountdownTimer from './CountdownTimer';
import { PRESALE_PRICE_ETH, FITOCHAIN_NETWORK, PRESALE_START_DATE, PRESALE_CONTROLLER_ADDRESS } from '../constants';
import { useWallet } from '../hooks/useWallet';
import { usePresaleContract } from '../hooks/usePresaleContract';
import { createFiatPayment } from '../services/nowpaymentsService';
import BankCardIcon from './icons/BankCardIcon';
import AdminControls from './AdminControls';

const Hero: React.FC = () => {
    const [ethAmount, setEthAmount] = useState('0.1');
    const [fitoAmount, setFitoAmount] = useState(0.1 / PRESALE_PRICE_ETH);
    const [referrer, setReferrer] = useState<string>(ethers.ZeroAddress);
    const [isCardPaymentLoading, setIsCardPaymentLoading] = useState(false);
    const [cardPaymentError, setCardPaymentError] = useState<string | null>(null);

    const { account, chainId, switchToFitochain, connectWallet } = useWallet();
    const {
        isPaused,
        isForceActive,
        raisedAmountEth,
        participants,
        isLoading,
        error: contractError,
        tx,
        buyTokens,
        setPause,
        setForceActivate,
    } = usePresaleContract();

    const isAdmin = account && account.toLowerCase() === PRESALE_CONTROLLER_ADDRESS.toLowerCase();
    
    // Calculate effective presale status
    const isPastStartDate = new Date().getTime() > new Date(PRESALE_START_DATE).getTime();
    const isCurrentlyActive = !isLoading && (isForceActive || isPastStartDate);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref && ethers.isAddress(ref) && account?.toLowerCase() !== ref.toLowerCase()) {
            setReferrer(ref);
        } else {
            setReferrer(ethers.ZeroAddress);
        }
    }, [account]);

    const isConnected = !!account;
    const isCorrectNetwork = chainId === FITOCHAIN_NETWORK.chainId;
    const canTransact = isCurrentlyActive && !isPaused && isConnected && isCorrectNetwork;
    
    const handleEthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEthAmount(value);
        const ethValue = parseFloat(value);
        if (!isNaN(ethValue) && ethValue > 0) {
            setFitoAmount(ethValue / PRESALE_PRICE_ETH);
        } else {
            setFitoAmount(0);
        }
    };

    const handleBuyWithCrypto = async () => {
        if (!canTransact) return;
        await buyTokens(ethAmount, referrer);
    };

    const handleBuyWithCard = async () => {
        if (isPaused) {
            setCardPaymentError("Presale is currently paused by the admin.");
            return;
        }
        if (!isCurrentlyActive) {
            setCardPaymentError("Presale is not active yet.");
            return;
        }
        if (!isConnected) {
            setCardPaymentError("Connect your wallet to proceed.");
            return;
        }
        const ethValue = parseFloat(ethAmount);
        if (isNaN(ethValue) || ethValue <= 0) {
            setCardPaymentError("Please enter a valid amount of ETH to purchase.");
            return;
        }

        setIsCardPaymentLoading(true);
        setCardPaymentError(null);
        const paymentUrl = await createFiatPayment(ethValue, account!);
        setIsCardPaymentLoading(false);

        if (paymentUrl) {
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
        } else {
            setCardPaymentError("Could not create payment link. Please try again later.");
        }
    };

    const getCryptoButtonText = () => {
        if (tx.loading) return "Processing...";
        if (isLoading) return "Loading Status..."
        if (!isCurrentlyActive) return "Presale Not Active";
        if (isPaused) return "Presale Paused";
        if (!isConnected) return "Connect Wallet to Buy";
        if (!isCorrectNetwork) return `Switch to ${FITOCHAIN_NETWORK.shortName}`;
        return "Buy FITO with Crypto";
    };

    const handleCryptoButtonClick = () => {
        if (!isCurrentlyActive || isPaused) return;
        if (!isConnected) connectWallet();
        else if (!isCorrectNetwork) switchToFitochain();
        else handleBuyWithCrypto();
    };

    const isCryptoButtonDisabled = isLoading || !isCurrentlyActive || isPaused || tx.loading;
    const isCardButtonDisabled = isLoading || !isCurrentlyActive || isPaused || !isConnected || isCardPaymentLoading;
    const combinedError = tx.error || contractError;

    return (
        <section className="container mx-auto px-6 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                    Fitochain <span className="text-green-500">Presale</span> {isCurrentlyActive ? (isPaused ? <span className="text-yellow-500">is Paused</span> : "is Live!") : "is Coming!"}
                </h2>
                <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0">
                    Be an early adopter of the FITO (Native Coin) and power the future of decentralized fitness. Join the movement today.
                </p>
                <div className="mt-8 flex justify-center lg:justify-start gap-4">
                     <a href={FITOCHAIN_NETWORK.infoURL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors">Learn More</a>
                     <a href={FITOCHAIN_NETWORK.explorers[0].url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-transparent border-2 border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-500 hover:text-white transition-colors">Explorer</a>
                </div>
            </div>

            <div className="lg:w-1/2 w-full max-w-md">
                 {!isCurrentlyActive ? (
                    <CountdownTimer targetDate={PRESALE_START_DATE} />
                ) : (
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200">
                    <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Join the Presale</h3>
                    <PresaleProgress raisedAmount={raisedAmountEth} participants={participants} />

                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500">Amount to Buy (in ETH)</label>
                            <div className="relative mt-1">
                                <input type="number" value={ethAmount} onChange={handleEthChange} className="w-full bg-slate-100 border border-slate-300 rounded-lg p-3 text-slate-900 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="0.0" />
                                <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 font-bold">ETH</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500">You Receive (FITO)</label>
                            <div className="relative mt-1">
                                <input type="text" readOnly value={fitoAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="w-full bg-slate-200 border border-slate-300 rounded-lg p-3 text-slate-800 text-lg" />
                                <span className="absolute inset-y-0 right-3 flex items-center text-slate-500 font-bold">FITO</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-4">1 ETH = {(1 / PRESALE_PRICE_ETH).toLocaleString()} FITO</p>
                    
                    <div className="mt-6 space-y-3">
                         <button onClick={handleCryptoButtonClick} disabled={isCryptoButtonDisabled && (isConnected && isCorrectNetwork)} className={`w-full text-lg font-bold py-3.5 rounded-lg transition-all duration-300 ${!isConnected ? 'bg-green-500 text-white hover:bg-green-600' : !isCorrectNetwork ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'} disabled:bg-slate-400 disabled:cursor-not-allowed`}>
                            {getCryptoButtonText()}
                        </button>
                        {isConnected && chainId && !isCorrectNetwork && <p className="text-center text-yellow-600 text-sm">Wrong Network! Your wallet is on chain ID {chainId}.</p>}

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-300"></div>
                            <span className="flex-shrink mx-4 text-slate-500 text-sm">OR</span>
                            <div className="flex-grow border-t border-slate-300"></div>
                        </div>

                        <button onClick={handleBuyWithCard} disabled={isCardButtonDisabled} className="w-full flex items-center justify-center gap-3 text-lg font-bold py-3.5 rounded-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:text-slate-500">
                           <BankCardIcon className="h-6 w-6"/>
                           {isCardPaymentLoading ? 'Processing...' : 'Get ETH with Card'}
                        </button>
                        {!isConnected && isCurrentlyActive && !isPaused && <p className="text-center text-slate-500 text-xs -mt-2">Connect wallet to enable card payments.</p>}
                        {cardPaymentError && <p className="text-center text-red-500 text-sm mt-1">{cardPaymentError}</p>}
                        {combinedError && <p className="text-center text-red-500 text-sm mt-1">{combinedError}</p>}
                        {tx.hash && (
                            <div className="mt-2 text-center text-green-600 text-sm">
                                <p>Transaction Successful!</p>
                                <a href={`${FITOCHAIN_NETWORK.explorers[0].url}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-green-700">
                                    View on Explorer
                                </a>
                            </div>
                        )}
                        {referrer !== ethers.ZeroAddress && !tx.hash && !tx.error && <p className="text-center text-green-600 text-sm mt-2">Referral code applied!</p>}
                    </div>
                </div>
                )}
                 {isAdmin && (
                    <AdminControls 
                        isForceActive={isForceActive}
                        isPaused={isPaused}
                        setForceActivate={setForceActivate}
                        setPause={setPause}
                        tx={tx}
                    />
                )}
            </div>
        </section>
    );
};

export default Hero;