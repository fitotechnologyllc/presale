import { NetworkInfo, PresaleTier } from './types';

export const FITOCHAIN_NETWORK: NetworkInfo = {
  name: "Fitochain Mainnet",
  chain: "FITOCHAIN",
  rpc: ["https://endpoint.fitochain.com"],
  faucets: [],
  nativeCurrency: {
    name: "Fito",
    symbol: "FITO",
    decimals: 18
  },
  features: [{ name: "EIP155" }, { name: "EIP1559" }],
  infoURL: "https://fitochain.com",
  shortName: "fitochain",
  chainId: 7777,
  networkId: 1,
  icon: "fitochain",
  explorers: [
    {
      name: "Fitochain",
      url: "https://explorer.fitochain.com",
      icon: "FITO",
      standard: "EIP3091"
    }
  ]
};

// Presale Details
export const PRESALE_PRICE_ETH = 0.0001; // 1 FITO = 0.0001 ETH (example)
export const PRESALE_HARD_CAP_ETH = 100; // 100 ETH Hard Cap (example)
// IMPORTANT: YOU MUST REPLACE THIS with your deployed presale contract address.
export const PRESALE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder
export const PRESALE_CONTROLLER_ADDRESS = "0xacF2bBEF2aEA2942cF740D8115d107107Da7106A";

// This is a minimal Application Binary Interface (ABI) for the presale contract.
// Ensure your smart contract exposes these functions.
export const PRESALE_ABI = [
    // Read functions
    "function paused() view returns (bool)",
    "function forceActive() view returns (bool)",
    "function totalWeiRaised() view returns (uint256)",
    "function participantCount() view returns (uint256)",

    // Write functions (for owner/admin)
    "function pause()",
    "function unpause()",
    "function setForceActive(bool _forceActive)",

    // Public write function
    "function buyTokens(address referrer) payable"
];

// Presale Timing & Tiers
export const PRESALE_START_DATE = "2025-08-31T00:00:00Z";

// Note: These tiers define the allocation of the presale portion of the tokens.
// The total percentage here is 80%, meaning the presale covers 80 ETH of the 100 ETH Hard Cap.
export const PRESALE_TIERS: PresaleTier[] = [
  { name: 'Tier 1 (Whales)', percentage: 35, color: 'bg-indigo-500' },
  { name: 'Tier 2 (Investors)', percentage: 25, color: 'bg-blue-500' },
  { name: 'Tier 3 (General Public)', percentage: 20, color: 'bg-teal-500' },
];

// Referral Program Details
export const REFERRAL_REWARD_PERCENTAGE = 0.5; // 0.5% reward