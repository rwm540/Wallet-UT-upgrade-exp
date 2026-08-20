import { CurrencyType, Asset, AssetCategory } from './types';
import { BASELINE_PRICES, BASELINE_CHANGES_24H } from './services/priceService';

export const INITIAL_TREASURY_RESERVES: Record<string, number> = {
  BTC: 25,          // 25 Bitcoins
  ETH: 350,         // 350 Ethereum
  TRX: 2500000,     // 2,500,000 Tron
  MATIC: 1200000,   // 1,200,000 Polygon MATIC
  GOLD: 1200,       // 1,200 Troy Ounces of Gold
  SILVER: 25000,    // 25,000 Troy Ounces of Silver
  PALLADIUM: 800,   // 800 Troy Ounces of Palladium
  UT: 1000000000,   // 1,000,000,000 Circulating & Tradable UT (1 Billion)
};

export const MOCK_PRICES: Record<string, number> = { ...BASELINE_PRICES };

export const ASSET_META: Record<string, {
  color: string;
  symbol: string;
  category: AssetCategory;
  unit: string;
  fullName: string;
  pairSymbol: string;
}> = {
  UT: { 
    color: '#2563eb', 
    symbol: 'UT', 
    category: 'native', 
    unit: 'UT', 
    fullName: 'UT(utility token)',
    pairSymbol: 'UT'
  },
  BTC: { 
    color: '#F7931A', 
    symbol: '₿', 
    category: 'crypto', 
    unit: 'BTC', 
    fullName: 'Bitcoin',
    pairSymbol: 'BTC'
  },
  ETH: { 
    color: '#627EEA', 
    symbol: 'Ξ', 
    category: 'crypto', 
    unit: 'ETH', 
    fullName: 'Ethereum',
    pairSymbol: 'ETH'
  },
  TRX: { 
    color: '#FF0013', 
    symbol: 'TRX', 
    category: 'crypto', 
    unit: 'TRX', 
    fullName: 'Tron',
    pairSymbol: 'TRX'
  },
  MATIC: { 
    color: '#8247E5', 
    symbol: 'POL', 
    category: 'crypto', 
    unit: 'POL', 
    fullName: 'Polygon (MATIC)',
    pairSymbol: 'POL'
  },
  GOLD: { 
    color: '#EAB308', 
    symbol: 'Au', 
    category: 'metals', 
    unit: 'oz', 
    fullName: 'Gold (XAU)',
    pairSymbol: 'Gold'
  },
  SILVER: { 
    color: '#94A3B8', 
    symbol: 'Ag', 
    category: 'metals', 
    unit: 'oz', 
    fullName: 'Silver (XAG)',
    pairSymbol: 'Silver'
  },
  PALLADIUM: { 
    color: '#06B6D4', 
    symbol: 'Pd', 
    category: 'metals', 
    unit: 'oz', 
    fullName: 'Palladium (XPD)',
    pairSymbol: 'XPD'
  },
};

export const ASSET_CONFIG = ASSET_META;

// Generates initial portfolio with clean zero or realistic balances for the user
export const generateInitialAssets = (uniqueUserKey: string, currentPrices: Record<string, number> = MOCK_PRICES): Asset[] => {
  const assetKeys: (keyof typeof CurrencyType)[] = ['UT', 'BTC', 'ETH', 'TRX', 'MATIC', 'GOLD', 'SILVER', 'PALLADIUM'];

  return assetKeys.map((key) => {
    const meta = ASSET_META[key];
    const seed = uniqueUserKey + key + "SALT-UT-2026";
    
    // Deterministic account hash
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        h1 = Math.imul(h1 ^ char, 2654435761);
        h2 = Math.imul(h2 ^ char, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    
    const fullHash = (BigInt(Math.abs(h1)) << 32n | BigInt(Math.abs(h2))).toString(16).toUpperCase();
    const cleanHash = "0x" + fullHash.substring(0, 10).padStart(10, '0');
    
    // Starting balance: User wallet holds strictly UT
    let initialBalance = 0;
    if (key === 'UT') initialBalance = 500000; // 500,000 UT stored in user's wallet
    else initialBalance = 0; // Other assets are reserve backings in treasury, user holds UT

    return {
      id: key,
      name: meta.fullName,
      symbol: meta.symbol,
      balance: initialBalance,
      accountNumber: cleanHash,
      color: meta.color,
      priceUsd: currentPrices[key] || BASELINE_PRICES[key as keyof typeof BASELINE_PRICES] || 1,
      change24h: BASELINE_CHANGES_24H[key as keyof typeof BASELINE_CHANGES_24H] || 0,
      category: meta.category,
      unit: meta.unit
    };
  });
};
