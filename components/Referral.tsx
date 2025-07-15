import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { REFERRAL_REWARD_PERCENTAGE } from '../constants';
import CopyIcon from './icons/CopyIcon';
import WalletIcon from './icons/WalletIcon';

const Referral: React.FC = () => {
    const { account, connectWallet } = useWallet();
    const [copied, setCopied] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    useEffect(() => {
        if (account) {
            const link = `${window.location.origin}${window.location.pathname}?ref=${account}`;
            setReferralLink(link);
        } else {
            setReferralLink('');
        }
    }, [account]);

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <section className="container mx-auto px-6 pb-12">
            <div className="bg-slate-50/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200 max-w-4xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    Refer & Earn!
                </h2>
                <p className="text-green-600 font-semibold text-lg mb-4">
                    Earn {REFERRAL_REWARD_PERCENTAGE}% of every contribution from your referrals.
                </p>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                    {account
                        ? "Share your unique referral link with your friends and community. You'll receive a reward in FITO for every successful contribution made through your link."
                        : "Connect your wallet to generate your unique referral link and start earning rewards."
                    }
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        placeholder="Connect wallet to get your referral link"
                        className="w-full flex-grow bg-slate-100 border border-slate-300 rounded-lg p-3 text-slate-600 focus:outline-none placeholder:text-slate-400"
                    />
                    {account ? (
                        <button
                            onClick={handleCopy}
                            className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
                        >
                            <CopyIcon className="h-5 w-5" />
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    ) : (
                         <button
                            onClick={connectWallet}
                            className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
                        >
                            <WalletIcon className="h-5 w-5" />
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Referral;