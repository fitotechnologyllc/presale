
import { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../types';
import { FITOCHAIN_NETWORK } from '../constants';

// We need to declare the ethereum provider type for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    account: null,
    chainId: null,
    error: null,
    isLoading: true, // Start in a loading state to check for provider and eager connect
  });

  const updateWalletState = useCallback((newState: Partial<WalletState>) => {
    setWallet(prevState => ({ ...prevState, ...newState }));
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      updateWalletState({ account: null, chainId: null, error: 'Wallet disconnected. Please connect again.' });
    } else {
      updateWalletState({ account: accounts[0], error: null });
    }
  }, [updateWalletState]);

  const handleChainChanged = useCallback((chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    updateWalletState({ chainId });
    if (chainId !== FITOCHAIN_NETWORK.chainId) {
        updateWalletState({ error: `Wrong Network. Please switch to ${FITOCHAIN_NETWORK.name}.` });
    } else {
        updateWalletState({ error: null });
    }
  }, [updateWalletState]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      updateWalletState({ error: 'MetaMask is not installed. Please install it to continue.', isLoading: false });
      return;
    }
    
    updateWalletState({ isLoading: true, error: null });
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);

      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      handleChainChanged(chainIdHex);

    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) { // EIP-1193 userRejectedRequest error
        updateWalletState({ error: 'Connection request rejected by user.' });
      } else {
        updateWalletState({ error: 'Failed to connect wallet. Please check your wallet and try again.' });
      }
    } finally {
        updateWalletState({ isLoading: false });
    }
  }, [handleAccountsChanged, handleChainChanged, updateWalletState]);
  
  const switchToFitochain = useCallback(async () => {
    if (!window.ethereum) {
        updateWalletState({ error: 'MetaMask is not installed.' });
        return;
    }
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${FITOCHAIN_NETWORK.chainId.toString(16)}` }],
        });
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${FITOCHAIN_NETWORK.chainId.toString(16)}`,
                        chainName: FITOCHAIN_NETWORK.name,
                        nativeCurrency: FITOCHAIN_NETWORK.nativeCurrency,
                        rpcUrls: FITOCHAIN_NETWORK.rpc,
                        blockExplorerUrls: [FITOCHAIN_NETWORK.explorers[0].url],
                    }],
                });
            } catch (addError: any) {
                console.error('Could not add Fitochain to MetaMask:', addError);
                updateWalletState({ error: 'Failed to add Fitochain network.' });
            }
        } else {
            console.error('Could not switch to Fitochain:', switchError);
            updateWalletState({ error: 'Failed to switch to Fitochain network.' });
        }
    }
  }, [updateWalletState]);

  // Main effect to handle wallet connection, listeners, and race conditions
  useEffect(() => {
    const initialize = () => {
        if (window.ethereum) {
            // MetaMask is available, set up listeners.
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            // Attempt to eagerly connect
            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        handleAccountsChanged(accounts);
                        window.ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged);
                    }
                })
                .catch((err: any) => {
                    console.error("Error during eager connection check:", err);
                })
                .finally(() => {
                    updateWalletState({ isLoading: false });
                });
        } else {
            // MetaMask not found immediately. We'll check again after a short delay.
            // This handles the race condition where the wallet is injected after the initial render.
            setTimeout(() => {
                if (window.ethereum) {
                    initialize(); // Found it, run initialization again.
                } else {
                    // Still not found after delay, assume it's not installed.
                    updateWalletState({ isLoading: false });
                }
            }, 1000); // 1 second delay to be safe
        }
    };

    initialize();

    // Cleanup listeners on component unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, updateWalletState]);

  return { ...wallet, connectWallet, switchToFitochain };
};
