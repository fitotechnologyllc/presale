export interface NetworkInfo {
  name: string;
  chain: string;
  rpc: string[];
  faucets: any[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  features: { name: string }[];
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  icon: string;
  explorers: {
    name: string;
    url: string;
    icon: string;
    standard: string;
  }[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface WalletState {
    account: string | null;
    chainId: number | null;
    error: string | null;
    isLoading: boolean;
}

export interface TimelineStep {
  date: string;
  title: string;
  description: string | string[];
}

export interface PresaleTier {
  name: string;
  percentage: number;
  color: string;
}