import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { SwapModal } from './components/SwapModal';
import { TransferModal } from './components/TransferModal';
import { BuyModal } from './components/BuyModal';
import { ApiPaymentModal } from './components/ApiPaymentModal';
import { DashboardPage } from './components/pages/DashboardPage';
import { TreasuryPage } from './components/pages/TreasuryPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { ChatWalletPage } from './components/pages/ChatWalletPage';
import { Button } from './components/Button';
import { UserState, Transaction } from './types';
import { generateInitialAssets, INITIAL_TREASURY_RESERVES } from './constants';
import { 
  LayoutDashboard, 
  LogOut, 
  Key, 
  Send, 
  RefreshCw, 
  Globe, 
  Wallet, 
  ShoppingCart, 
  History,
  Building2,
  MoreHorizontal,
  X,
  ArrowRightLeft,
  Copy,
  Check,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { translations, LANGUAGES, LanguageCode } from './translations';
import { formatNumber, formatTokenPrice } from './utils';
import { 
  LiveMarketPrices, 
  BASELINE_PRICES, 
  BASELINE_CHANGES_24H, 
  fetchLiveMarketPrices, 
  calculateUTBackedPrice,
  UT_TOTAL_SUPPLY 
} from './services/priceService';
import { AnimatePresence, motion } from 'motion/react';

const generateUniqueKey = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `KEY-${timestamp}-${random}`.toUpperCase();
};

type AppView = 'dashboard' | 'treasury' | 'history' | 'chatwallet';

export const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('fa');
  const [user, setUser] = useState<UserState>({
    isAuthenticated: false,
    uniqueKey: null,
    walletAddress: null,
    assets: [],
    transactions: [],
    externalBalance: 0,
  });

  // Active view: Dashboard, Treasury, History
  const [view, setView] = useState<AppView>('dashboard');
  
  // 3-Dots Animated Menu state (Android BottomSheet & Web Popup)
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  // Modals
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferDefaultAsset, setTransferDefaultAsset] = useState<string | undefined>(undefined);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isApiPaymentOpen, setIsApiPaymentOpen] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);

  // Real-time market prices state (USD)
  const [marketPrices, setMarketPrices] = useState<LiveMarketPrices>(BASELINE_PRICES);
  const [priceChanges, setPriceChanges] = useState(BASELINE_CHANGES_24H);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  // Treasury Reserves
  const [treasuryReserves] = useState<Record<string, number>>(INITIAL_TREASURY_RESERVES);
  const [circulatingUT, setCirculatingUT] = useState<number>(UT_TOTAL_SUPPLY);

  const t = translations[lang];

  // Set RTL / LTR based on language
  useEffect(() => {
    const selectedLang = LANGUAGES.find(l => l.code === lang);
    if (selectedLang) {
      document.dir = selectedLang.dir;
      if (lang === 'fa' || lang === 'ar') {
        document.body.classList.add('font-persian');
      } else {
        document.body.classList.remove('font-persian');
      }
    }
  }, [lang]);

  // Initial & periodic live price fetching
  const refreshPrices = async () => {
    setIsRefreshingPrices(true);
    try {
      const { prices: livePrices, changes } = await fetchLiveMarketPrices(marketPrices);
      
      // Calculate dynamic UT price based on 100% current reserves
      const { utPrice } = calculateUTBackedPrice(
        treasuryReserves,
        livePrices as unknown as Record<string, number>,
        circulatingUT
      );
      
      livePrices.UT = utPrice;

      setMarketPrices(livePrices);
      setPriceChanges(changes);

      // Update user assets priceUsd
      setUser(prev => {
        if (!prev.isAuthenticated) return prev;
        const updatedAssets = prev.assets.map(asset => ({
          ...asset,
          priceUsd: (livePrices as any)[asset.id] || asset.priceUsd,
          change24h: (changes as any)[asset.id] || asset.change24h
        }));
        return { ...prev, assets: updatedAssets };
      });
    } catch (e) {
      console.warn('Live price fetch fallback used');
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  useEffect(() => {
    refreshPrices();
    const interval = setInterval(refreshPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (type: 'metamask' | 'trust') => {
    const newKey = generateUniqueKey();
    const assets = generateInitialAssets(newKey, marketPrices as unknown as Record<string, number>);
    setWalletType(type);
    const seedExternalFunds = Math.floor(Math.random() * 25000) + 12000;

    setUser({
      isAuthenticated: true,
      uniqueKey: newKey,
      walletAddress: type === 'metamask' ? '0x71C824...3A9F' : 'bnb1x97...8s2q',
      assets: assets,
      transactions: [],
      externalBalance: seedExternalFunds,
    });
  };

  const handleLogout = () => {
    setUser({
      isAuthenticated: false,
      uniqueKey: null,
      walletAddress: null,
      assets: [],
      transactions: [],
      externalBalance: 0,
    });
    setWalletType(null);
    setView('dashboard');
    setIsOverflowMenuOpen(false);
  };

  const copyUserKey = () => {
    if (user.uniqueKey) {
      navigator.clipboard.writeText(user.uniqueKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  // 1. SWAP Handler
  const handleSwap = (fromId: string, toId: string, amount: number) => {
    const sourceAsset = user.assets.find(a => a.id === fromId);
    if (!sourceAsset || sourceAsset.balance < amount) return;

    const fromPrice = marketPrices[fromId as keyof LiveMarketPrices] || 1;
    const toPrice = marketPrices[toId as keyof LiveMarketPrices] || 1;
    const receivedAmount = (amount * fromPrice) / toPrice;

    // Adjust treasury reserves if trading with UT
    if (fromId === 'UT') {
      setCirculatingUT(prev => Math.max(100000, prev - amount));
    } else if (toId === 'UT') {
      setCirculatingUT(prev => prev + receivedAmount);
    }

    setUser(prev => {
      const newAssets = prev.assets.map(asset => {
        if (asset.id === fromId) return { ...asset, balance: asset.balance - amount };
        if (asset.id === toId) return { ...asset, balance: asset.balance + receivedAmount };
        return asset;
      });
      const newTransaction: Transaction = {
        id: `TX-SWP-${Date.now()}`,
        type: 'SWAP',
        amount,
        currency: fromId,
        toCurrency: toId,
        toAmount: receivedAmount,
        date: Date.now(),
        status: 'Completed'
      };
      return { ...prev, assets: newAssets, transactions: [...prev.transactions, newTransaction] };
    });
  };

  // 2. TRANSFER Handler
  const handleTransfer = (assetId: string, amount: number, address: string) => {
    const sourceAsset = user.assets.find(a => a.id === assetId);
    if (!sourceAsset || sourceAsset.balance < amount) return;

    setUser(prev => {
      const newAssets = prev.assets.map(asset => {
        if (asset.id === assetId) return { ...asset, balance: asset.balance - amount };
        return asset;
      });
      const newTransaction: Transaction = {
        id: `TX-TRF-${Date.now()}`,
        type: 'TRANSFER',
        amount,
        currency: assetId,
        toAddress: address,
        date: Date.now(),
        status: 'Completed'
      };
      return { ...prev, assets: newAssets, transactions: [...prev.transactions, newTransaction] };
    });
  };

  // 3. BUY Handler
  const handleBuy = (assetId: string, amount: number, totalCost: number) => {
    if (user.externalBalance < totalCost) return;

    if (assetId === 'UT') {
      setCirculatingUT(prev => prev + amount);
    }

    setUser(prev => {
      const newAssets = prev.assets.map(asset => {
        if (asset.id === assetId) return { ...asset, balance: asset.balance + amount };
        return asset;
      });
      const newTransaction: Transaction = {
        id: `TX-BUY-${Date.now()}`,
        type: 'DEPOSIT',
        amount,
        currency: assetId,
        date: Date.now(),
        status: 'Completed'
      };
      return { 
        ...prev, 
        assets: newAssets, 
        transactions: [...prev.transactions, newTransaction],
        externalBalance: prev.externalBalance - totalCost
      };
    });
  };

  const handleUpdateUTBalance = (delta: number, description: string): boolean => {
    const utAsset = user.assets.find(a => a.id === 'UT');
    if (!utAsset || utAsset.balance + delta < 0) {
      return false;
    }
    setUser(prev => {
      const newAssets = prev.assets.map(asset => {
        if (asset.id === 'UT') {
          return { ...asset, balance: asset.balance + delta };
        }
        return asset;
      });
      const newTx: Transaction = {
        id: `TX-API-${Date.now()}`,
        type: 'TRANSFER',
        amount: Math.abs(delta),
        currency: 'UT',
        toAddress: description,
        date: Date.now(),
        status: 'Completed'
      };
      return {
        ...prev,
        assets: newAssets,
        transactions: [...prev.transactions, newTx]
      };
    });
    return true;
  };

  // Calculate Total Net Worth (USD)
  const totalNetWorthUSD = user.assets.reduce((acc, curr) => {
    const price = marketPrices[curr.id as keyof LiveMarketPrices] || curr.priceUsd || 0;
    return acc + (curr.balance * price);
  }, 0);

  const LanguageSelectorDropdown = () => (
    <div className="relative group">
      <button 
        type="button" 
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-all font-bold text-xs border border-slate-200/80 shadow-sm active:translate-y-0.5"
      >
        <Globe className="w-4 h-4 text-blue-600" />
        <span className="uppercase">{lang}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>
      <div className="absolute end-0 top-full pt-1.5 w-44 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-1.5">
          {LANGUAGES.map(l => (
            <button 
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`w-full text-start px-3.5 py-2.5 rounded-xl text-xs transition-colors flex justify-between items-center ${
                lang === l.code ? 'font-black text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <span>{l.name}</span>
              {lang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // If not authenticated, display Login screen
  if (!user.isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute top-4 end-4 z-50">
          <LanguageSelectorDropdown />
        </div>
        <Login onLogin={handleLogin} t={t} />
      </div>
    );
  }

  // Navigation Items Config
  const NAV_ITEMS = [
    {
      id: 'dashboard' as AppView,
      label: t.dashboardNav,
      icon: LayoutDashboard,
      activeGradient: 'from-emerald-600 to-teal-600',
      activeShadow: 'shadow-[0_4px_12px_rgba(5,150,105,0.35)]',
      activeBorder: 'border-b-4 border-emerald-800',
      colorText: 'text-emerald-600',
    },
    {
      id: 'treasury' as AppView,
      label: t.treasuryNav,
      icon: Building2,
      activeGradient: 'from-sky-500 to-teal-600',
      activeShadow: 'shadow-[0_4px_12px_rgba(14,165,233,0.35)]',
      activeBorder: 'border-b-4 border-sky-700',
      colorText: 'text-sky-600',
    },
    {
      id: 'history' as AppView,
      label: t.historyNav,
      icon: History,
      activeGradient: 'from-teal-600 to-emerald-600',
      activeShadow: 'shadow-[0_4px_12px_rgba(13,148,136,0.35)]',
      activeBorder: 'border-b-4 border-teal-800',
      colorText: 'text-teal-600',
    },
    {
      id: 'chatwallet' as AppView,
      label: 'ChatWallet',
      icon: MessageSquare,
      activeGradient: 'from-emerald-600 via-teal-600 to-sky-600',
      activeShadow: 'shadow-[0_4px_12px_rgba(16,185,129,0.35)]',
      activeBorder: 'border-b-4 border-emerald-800',
      colorText: 'text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-sky-50/40 to-slate-100/80 text-slate-900 pb-28 md:pb-16">
      
      {/* 1. TOP LIVE REAL PRICE TICKER BAR (Luminous Sky & Emerald Market Ribbon - Zero Dark Elements) */}
      <div className="bg-white/95 backdrop-blur-md text-slate-800 text-xs border-b border-emerald-200/80 px-2 sm:px-3 py-2 sm:py-1.5 sticky top-0 z-50 shadow-sm h-auto min-h-[42px] sm:min-h-[33px] flex items-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5" dir="ltr">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0 border border-emerald-300 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE USD
            </span>

            {/* UT Backed Token */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-sky-50 px-2.5 py-0.5 rounded-lg shrink-0 border border-emerald-300/80 font-mono shadow-xs">
              <span className="font-black text-emerald-700">UT/USD:</span>
              <span className="font-black text-slate-900">${formatTokenPrice(marketPrices.UT, lang)}</span>
              <span className="text-[10px] text-emerald-600 font-black">+{priceChanges.UT}%</span>
            </div>

            {/* Metals */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg shrink-0 border border-amber-200 font-mono">
              <span className="font-bold text-amber-700">Gold/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.GOLD, lang, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded-lg shrink-0 border border-sky-200 font-mono">
              <span className="font-bold text-sky-700">Silver/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.SILVER, lang, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-lg shrink-0 border border-teal-200 font-mono">
              <span className="font-bold text-teal-700">Palladium/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.PALLADIUM, lang, { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Cryptos */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg shrink-0 border border-slate-200 font-mono">
              <span className="font-bold text-orange-600">BTC/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.BTC, lang, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg shrink-0 border border-slate-200 font-mono">
              <span className="font-bold text-sky-600">ETH/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.ETH, lang, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg shrink-0 border border-slate-200 font-mono">
              <span className="font-bold text-rose-600">TRX/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.TRX, lang, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg shrink-0 border border-slate-200 font-mono">
              <span className="font-bold text-emerald-600">POL/USD:</span>
              <span className="font-black text-slate-800">${formatNumber(marketPrices.MATIC, lang, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <button 
            onClick={refreshPrices}
            disabled={isRefreshingPrices}
            title={t.refreshPrices}
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors shrink-0 text-[11px] font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPrices ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">{t.refreshPrices}</span>
          </button>
        </div>
      </div>

      {/* 2. TOP MAIN APP BAR (Modern Emerald-Sky Accent Header) */}
      <header className="bg-white/95 backdrop-blur-md sticky top-[42px] sm:top-[33px] z-40 border-b border-emerald-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Left: App Brand Logo */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              {/* 3D Embossed UT Icon in Emerald & Sky Gradient */}
              <div className="relative w-11 h-11 bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-[0_6px_16px_rgba(5,150,105,0.35)] border-b-2 border-emerald-800 group-hover:scale-105 transition-transform">
                <span className="tracking-tighter">UT</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none"></div>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-lg leading-none group-hover:text-emerald-600 transition-colors">
                    {t.appName}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md hidden md:inline-block border border-emerald-200">
                    100% Backed
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold hidden sm:block">
                  Gold, Metals & Crypto Vault
                </span>
              </div>
            </motion.div>

            {/* Center: Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-emerald-100/90 shadow-inner">
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isActive = view === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView(item.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-b ${item.activeGradient} text-white ${item.activeShadow} ${item.activeBorder}` 
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : item.colorText}`} />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              
              {/* Desktop Key Badge */}
              <button 
                onClick={copyUserKey}
                title="Click to copy your unique hash key"
                className="hidden lg:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-2 rounded-xl border border-emerald-200 transition-all text-xs font-mono font-bold text-emerald-900 shadow-xs active:translate-y-0.5"
                dir="ltr"
              >
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[100px]">{user.uniqueKey}</span>
                {keyCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-emerald-500" />
                )}
              </button>

              {/* Desktop Language Selector */}
              <div className="hidden sm:block">
                <LanguageSelectorDropdown />
              </div>

              {/* Desktop Direct Logout Button */}
              <button 
                onClick={handleLogout} 
                title={t.logout}
                className="hidden md:flex p-2.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 hover:text-rose-700 transition-all border-b-2 border-rose-200 shadow-sm active:translate-y-0.5"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER (Strictly isolated pages with motion animation) */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: DASHBOARD PAGE (داشبورد دارایی‌ها) */}
          {view === 'dashboard' && (
            <DashboardPage
              key="page-dashboard"
              user={user}
              marketPrices={marketPrices}
              totalNetWorthUSD={totalNetWorthUSD}
              t={t}
              lang={lang}
              onOpenBuy={() => setIsBuyOpen(true)}
              onOpenSwap={() => setIsSwapOpen(true)}
              onOpenTransfer={(assetId) => {
                setTransferDefaultAsset(assetId);
                setIsTransferOpen(true);
              }}
              onOpenApiPayment={() => setIsApiPaymentOpen(true)}
            />
          )}

          {/* VIEW 2: TREASURY PAGE (خزانه و ذخایر ۱۰۰٪ پشتیبان) */}
          {view === 'treasury' && (
            <TreasuryPage
              key="page-treasury"
              t={t}
              lang={lang}
              prices={marketPrices}
              reserves={treasuryReserves}
              circulatingUT={circulatingUT}
            />
          )}

          {/* VIEW 3: HISTORY PAGE (تاریخچه تراکنش‌ها) */}
          {view === 'history' && (
            <HistoryPage
              key="page-history"
              transactions={user.transactions}
              t={t}
              lang={lang}
            />
          )}

          {/* VIEW 4: CHATWALLET PAGE (چت‌والت زنده و چت‌بات) */}
          {view === 'chatwallet' && (
            <ChatWalletPage
              key="page-chatwallet"
              user={user}
              t={t}
              lang={lang}
              onUpdateBalance={handleUpdateUTBalance}
            />
          )}

        </AnimatePresence>
      </main>

      {/* 4. DEDICATED ANDROID 3D BOTTOM NAVIGATION DOCK (STRICTLY ICON-ONLY WITH NO TEXT LABELS - PURE LIGHT EMERALD & SKY THEME) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3.5 pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-2 border-2 border-emerald-100 shadow-[0_12px_36px_rgba(16,185,129,0.18)] pointer-events-auto grid grid-cols-5 gap-1.5"
        >
          {/* Nav Item 1: Dashboard (ICON ONLY) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setView('dashboard')}
            title={t.dashboardNav}
            aria-label={t.dashboardNav}
            className={`relative flex items-center justify-center py-3.5 px-2 rounded-2xl transition-all ${
              view === 'dashboard'
                ? 'bg-gradient-to-b from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/35 border-b-2 border-emerald-800'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/80'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {view === 'dashboard' && (
              <motion.div layoutId="androidIndicator" className="absolute -bottom-1 w-2 h-1 bg-white rounded-full" />
            )}
          </motion.button>

          {/* Nav Item 2: Treasury (ICON ONLY) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setView('treasury')}
            title={t.treasuryNav}
            aria-label={t.treasuryNav}
            className={`relative flex items-center justify-center py-3.5 px-2 rounded-2xl transition-all ${
              view === 'treasury'
                ? 'bg-gradient-to-b from-sky-500 to-teal-600 text-white shadow-lg shadow-sky-500/35 border-b-2 border-sky-700'
                : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50/80'
            }`}
          >
            <Building2 className="w-5 h-5" />
            {view === 'treasury' && (
              <motion.div layoutId="androidIndicator" className="absolute -bottom-1 w-2 h-1 bg-white rounded-full" />
            )}
          </motion.button>

          {/* Nav Item 3: History (ICON ONLY) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setView('history')}
            title={t.historyNav}
            aria-label={t.historyNav}
            className={`relative flex items-center justify-center py-3.5 px-2 rounded-2xl transition-all ${
              view === 'history'
                ? 'bg-gradient-to-b from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/35 border-b-2 border-teal-800'
                : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50/80'
            }`}
          >
            <History className="w-5 h-5" />
            {view === 'history' && (
              <motion.div layoutId="androidIndicator" className="absolute -bottom-1 w-2 h-1 bg-white rounded-full" />
            )}
          </motion.button>

          {/* Nav Item 4: ChatWallet (ICON ONLY) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setView('chatwallet')}
            title="ChatWallet"
            aria-label="ChatWallet"
            className={`relative flex items-center justify-center py-3.5 px-2 rounded-2xl transition-all ${
              view === 'chatwallet'
                ? 'bg-gradient-to-b from-emerald-600 via-teal-600 to-sky-600 text-white shadow-lg shadow-emerald-600/35 border-b-2 border-emerald-800'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/80'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {view === 'chatwallet' && (
              <motion.div layoutId="androidIndicator" className="absolute -bottom-1 w-2 h-1 bg-white rounded-full" />
            )}
          </motion.button>

          {/* Nav Item 5: 3-DOTS ("...") MORE MENU BUTTON (STRICTLY ICON ONLY - ZERO TEXT) */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setIsOverflowMenuOpen(true)}
            title="بیشتر / More Options"
            aria-label="بیشتر"
            className={`relative flex items-center justify-center py-3.5 px-2 rounded-2xl transition-all ${
              isOverflowMenuOpen
                ? 'bg-gradient-to-b from-emerald-600 via-teal-600 to-sky-600 text-white shadow-lg shadow-emerald-600/35 border-b-2 border-emerald-800'
                : 'text-slate-600 hover:text-emerald-700 bg-emerald-50/80 border-b-2 border-emerald-200/80 hover:bg-emerald-100/80'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5" />
              <span className="absolute -top-1 -end-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -end-1 w-2 h-2 bg-emerald-600 rounded-full"></span>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* 5. 3-DOTS ANIMATED BOTTOMSHEET & MODAL DIALOG (Luminous Emerald & Sky Theme) */}
      <AnimatePresence>
        {isOverflowMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            
            {/* Backdrop Blur with Soft Fade */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setIsOverflowMenuOpen(false)}
            />

            {/* BottomSheet Card on Mobile / Centered Modal on Desktop */}
            <motion.div 
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-emerald-100 overflow-hidden z-10 flex flex-col max-h-[85vh] m-3 sm:m-4"
            >
              {/* Top Drag Handle for Android Sheet */}
              <div className="md:hidden pt-3 pb-1 flex justify-center">
                <div className="w-12 h-1.5 bg-emerald-200 rounded-full" />
              </div>
              
              {/* Header (3D Metallic Emerald & Sky Gradient) */}
              <div className="bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-800 p-5 text-white flex items-center justify-between border-b-4 border-emerald-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_8px_16px_rgba(6,95,70,0.3)] relative overflow-hidden rounded-t-[28px]">
                {/* 3D Glossy Light Reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none"></div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-700 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_2px_3px_rgba(255,255,255,0.6)] border-2 border-emerald-300">
                    UT
                  </div>
                  <div>
                    <h3 className="font-black text-base drop-shadow-md">{t.appName}</h3>
                    <div className="flex items-center gap-2 text-xs text-emerald-100 drop-shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_8px_#6ee7b7]"></span>
                      <span className="font-mono uppercase font-bold">{walletType || 'WALLET'}</span>
                      <span className="text-emerald-200">•</span>
                      <span className="text-white font-extrabold bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-400/30 text-[10px]">متصل</span>
                    </div>
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOverflowMenuOpen(false)}
                  className="p-2.5 rounded-2xl bg-black/20 hover:bg-black/30 text-white transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/20 relative z-10 cursor-pointer"
                >
                  <X className="w-5 h-5 drop-shadow-md" />
                </motion.button>
              </div>

              {/* Body Options with Scroll */}
              <div className="p-5 space-y-4 overflow-y-auto">
                
                {/* Account / Hash Key Info Card */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.accountNo} (کلید هش حساب)</span>
                    </span>
                    <motion.button 
                      whileTap={{ scale: 0.92 }}
                      onClick={copyUserKey}
                      className="flex items-center gap-1 text-emerald-700 font-black hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs"
                    >
                      {keyCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{keyCopied ? 'کپی شد' : 'کپی کلید'}</span>
                    </motion.button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 font-black bg-white p-2.5 rounded-xl border border-emerald-200 break-all select-all text-center tracking-wide" dir="ltr">
                    {user.uniqueKey}
                  </div>
                </div>

                {/* Total Net Worth Snapshot */}
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 p-4 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-800 block mb-0.5">
                      {t.totalNetWorth}
                    </span>
                    <span className="text-xl font-black text-slate-900" dir="ltr">
                      ${formatNumber(totalNetWorthUSD, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-md shadow-emerald-500/30">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2 px-1">
                    عملیات سریع کیف پول
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setIsOverflowMenuOpen(false);
                        setIsBuyOpen(true);
                      }}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 flex flex-col items-center gap-1.5 transition-all text-xs font-black"
                    >
                      <ShoppingCart className="w-5 h-5 text-emerald-600" />
                      <span>{t.buy}</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setIsOverflowMenuOpen(false);
                        setIsSwapOpen(true);
                      }}
                      className="p-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-2xl border border-sky-200 flex flex-col items-center gap-1.5 transition-all text-xs font-black"
                    >
                      <ArrowRightLeft className="w-5 h-5 text-sky-600" />
                      <span>{t.swap}</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setIsOverflowMenuOpen(false);
                        setIsTransferOpen(true);
                      }}
                      className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-2xl border border-teal-200 flex flex-col items-center gap-1.5 transition-all text-xs font-black"
                    >
                      <Send className="w-5 h-5 text-teal-600" />
                      <span>{t.transfer}</span>
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setIsOverflowMenuOpen(false);
                      setView('chatwallet');
                    }}
                    className="w-full mt-2.5 p-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white rounded-2xl shadow-md flex items-center justify-center gap-2 font-black text-xs"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>ورود به ChatWallet (چت زنده و چت‌بات)</span>
                  </motion.button>
                </div>

                {/* Language Selection Grid */}
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2 px-1 flex items-center justify-between">
                    <span>انتخاب زبان (Languages)</span>
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LANGUAGES.map(l => (
                      <motion.button
                        key={l.code}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setLang(l.code)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          lang === l.code 
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-black' 
                            : 'bg-slate-50 hover:bg-emerald-50/50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{l.name}</span>
                        {lang === l.code && <Check className="w-4 h-4 text-white" />}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Refresh Live Rates Action */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    refreshPrices();
                    setIsOverflowMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold text-xs border border-emerald-200 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingPrices ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
                  <span>بروزرسانی نرخ لحظه‌ای ارزها و فلزات</span>
                </motion.button>

                {/* Logout Button */}
                <Button 
                  variant="danger" 
                  fullWidth 
                  className="py-3 mt-2 shadow-md" 
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> {t.logout}
                </Button>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODALS */}
      <SwapModal 
        isOpen={isSwapOpen} 
        onClose={() => setIsSwapOpen(false)} 
        assets={user.assets} 
        prices={marketPrices as unknown as Record<string, number>}
        onSwap={handleSwap} 
        t={t} 
        lang={lang} 
      />
      
      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => {
          setIsTransferOpen(false);
          setTransferDefaultAsset(undefined);
        }} 
        assets={user.assets} 
        onTransfer={handleTransfer} 
        t={t} 
        lang={lang} 
        defaultAssetId={transferDefaultAsset}
      />
      
      <BuyModal 
        isOpen={isBuyOpen} 
        onClose={() => setIsBuyOpen(false)} 
        assets={user.assets} 
        onBuy={handleBuy} 
        t={t} 
        lang={lang} 
        walletType={walletType} 
        externalBalance={user.externalBalance}
      />

      <ApiPaymentModal
        isOpen={isApiPaymentOpen}
        onClose={() => setIsApiPaymentOpen(false)}
        user={user}
        onUpdateUser={setUser}
        lang={lang}
      />

    </div>
  );
};

export default App;
