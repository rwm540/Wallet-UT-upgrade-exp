export enum CurrencyType {
  UT = 'UT Token',
  BTC = 'Bitcoin',
  ETH = 'Ethereum',
  TRX = 'Tron',
  MATIC = 'Polygon (MATIC)',
  GOLD = 'Gold (XAU)',
  SILVER = 'Silver (XAG)',
  PALLADIUM = 'Palladium (XPD)',
}

export type AssetCategory = 'native' | 'crypto' | 'metals';

export interface Asset {
  id: string; // The CurrencyType key
  name: string;
  symbol: string;
  balance: number;
  accountNumber: string; // The specific hashed account number
  color: string;
  priceUsd: number;
  change24h?: number;
  category: AssetCategory;
  unit?: string;
}

export interface TreasuryReserveItem {
  id: string;
  amount: number;
  unit: string;
}

export interface TreasuryState {
  reserves: Record<string, number>; // Total available in treasury
  circulatingUT: number;
}

export type TransactionType = 'SWAP' | 'TRANSFER' | 'DEPOSIT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  toCurrency?: string; // For Swaps
  toAmount?: number;   // For Swaps
  toAddress?: string;  // For Transfers
  date: number;        // Timestamp
  status: 'Completed' | 'Pending';
}

export interface UserState {
  isAuthenticated: boolean;
  uniqueKey: string | null; // The one-time username key
  walletAddress: string | null;
  assets: Asset[];
  transactions: Transaction[];
  externalBalance: number; // Simulating funds in MetaMask/Trust (in USD)
}
