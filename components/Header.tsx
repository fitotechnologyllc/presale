import React from 'react';
import WalletIcon from './icons/WalletIcon';
import { useWallet } from '../hooks/useWallet';
import { PRESALE_CONTROLLER_ADDRESS } from '../constants';

const Header: React.FC = () => {
    const { account, isLoading, error, connectWallet } = useWallet();

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const isAdmin = account && account.toLowerCase() === PRESALE_CONTROLLER_ADDRESS.toLowerCase();

    return (
        <header className="bg-[#6d6e71] sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-12">
                <div className="flex items-center gap-3">
                    <img src="https://fitochain.com/wp-content/uploads/2025/07/DeFi-Fito.png" alt="Fitochain Logo" className="h-8 w-8" />
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">Fitochain</h1>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <span className="px-3 py-1 text-sm font-bold text-indigo-100 bg-indigo-600 rounded-full">ADMIN</span>
                    )}
                    <button
                        onClick={connectWallet}
                        disabled={isLoading || !!account}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200 disabled:bg-slate-500 disabled:cursor-not-allowed"
                    >
                        <WalletIcon className="h-5 w-5" />
                        {isLoading ? 'Connecting...' : account ? formatAddress(account) : 'Connect Wallet'}
                    </button>
                </div>
            </div>
            {error && (
                <div className="bg-red-500 text-white text-center font-semibold text-sm py-2">
                    {error.includes('MetaMask is not installed') ? (
                        <span>
                            MetaMask not detected. Please{' '}
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold underline hover:text-red-200 transition-colors"
                            >
                                install MetaMask
                            </a>
                            {' '}to continue.
                        </span>
                    ) : (
                        <span>{error}</span>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;