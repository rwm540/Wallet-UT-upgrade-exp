import React from 'react';
import { AssetCard } from '../AssetCard';
import { Button } from '../Button';
import { Asset, UserState } from '../../types';
import { Translation, LanguageCode } from '../../translations';
import { formatNumber } from '../../utils';
import { LiveMarketPrices } from '../../services/priceService';
import { 
  Wallet, 
  ShoppingCart, 
  ArrowRightLeft, 
  Send, 
  ShieldCheck, 
  Gem, 
  Coins, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPageProps {
  user: UserState;
  marketPrices: LiveMarketPrices;
  totalNetWorthUSD: number;
  t: Translation;
  lang: LanguageCode;
  onOpenBuy: () => void;
  onOpenSwap: () => void;
  onOpenTransfer: (assetId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  marketPrices,
  totalNetWorthUSD,
  t,
  lang,
  onOpenBuy,
  onOpenSwap,
  onOpenTransfer,
}) => {
  const nativeAsset = user.assets.find(a => a.id === 'UT');
  const metalsAssets = user.assets.filter(a => a.category === 'metals');
  const cryptoAssets = user.assets.filter(a => a.category === 'crypto');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="space-y-7"
    >
      {/* 1. Global Net Worth & Quick Actions Banner (Modern Emerald Green & Sky Blue Theme) */}
      <section className="bg-gradient-to-br from-emerald-800 via-teal-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-b-4 border-emerald-900">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* Net Worth Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl text-sky-200 border border-white/20">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-emerald-100 uppercase tracking-wider">
                {t.totalNetWorth} (ارزش کل دارایی‌ها)
              </span>
            </div>
            
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" dir="ltr">
                ${formatNumber(totalNetWorthUSD, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <span className="text-xs font-black text-emerald-900 bg-emerald-200/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                USD
              </span>
            </div>

            {/* UT valuation metric */}
            <p className="text-xs text-emerald-100 mt-2 flex items-center gap-1.5 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0" />
              <span>نرخ پایه ارز UT با پشتوانه ۱۰۰٪ ذخایر:</span>
              <span className="font-bold text-sky-200 font-mono" dir="ltr">
                1 UT = ${formatNumber(marketPrices.UT, lang, { minimumFractionDigits: 2 })} USD
              </span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <Button 
              variant="primary" 
              className="bg-emerald-600 hover:bg-emerald-500 border-emerald-800 shadow-lg shadow-emerald-900/30 py-3 px-5 text-white" 
              onClick={onOpenBuy}
            >
              <ShoppingCart className="w-4 h-4" /> {t.buy}
            </Button>

            <Button 
              variant="secondary" 
              className="py-3 px-5 bg-sky-500 hover:bg-sky-400 border-sky-700 text-white shadow-lg shadow-sky-900/30" 
              onClick={onOpenSwap}
            >
              <ArrowRightLeft className="w-4 h-4" /> {t.swap}
            </Button>

            <Button 
              variant="primary" 
              className="bg-teal-600 hover:bg-teal-500 border-teal-800 shadow-lg shadow-teal-900/30 py-3 px-5 text-white" 
              onClick={() => onOpenTransfer()}
            >
              <Send className="w-4 h-4" /> {t.transfer}
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute end-0 top-0 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute start-0 bottom-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 2. CATEGORY 1: Native UT Token (پشتوانه ۱۰۰٪ ذخایر) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm"></div>
            <h2 className="text-lg font-black text-slate-800">
              {t.nativeCategory} (ارز اختصاصی با پشتوانه ذخایر)
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            UT Ecosystem
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nativeAsset && (
            <AssetCard 
              key={nativeAsset.id} 
              asset={nativeAsset} 
              onClick={onOpenSwap} 
              t={t} 
              lang={lang} 
            />
          )}

          {/* UT Ecosystem Info Box */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-sky-50 border border-emerald-200/80 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>پشتوانه ۱۰۰٪ دارایی‌های فیزیکی و دیجیتال</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ارز UT توسط سبدی متشکل از طلا، نقره، پالادیوم، بیت‌کوین، اتریوم، ترون و پالیگان پشتیبانی می‌شود و همواره امکان بازخرید و تبدیل آن با ارزش منصفانه وجود دارد.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-emerald-200/60">
              <span className="text-xs font-bold text-slate-500">قابلیت تبدیل فوری:</span>
              <button 
                onClick={onOpenSwap}
                className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm transition-all active:scale-95"
              >
                <span>تبدیل UT به سایر دارایی‌ها</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY 2: Precious Metals (طلا، نقره، پالادیوم) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-800">
              {t.metalsCategory} (طلا، نقره، پالادیوم)
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            پشتوانه فیزیکی خزانه
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {metalsAssets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onClick={() => onOpenTransfer(asset.id)} 
              t={t} 
              lang={lang} 
            />
          ))}
        </div>
      </div>

      {/* 4. CATEGORY 3: Cryptocurrencies (بیت‌کوین، اتریوم، ترون، پالیگان) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-black text-slate-800">
              {t.cryptoCategory} (بیت‌کوین، اتریوم، ترون، متیک)
            </h2>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            ذخایر ارزی معتبر
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cryptoAssets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onClick={() => onOpenTransfer(asset.id)} 
              t={t} 
              lang={lang} 
            />
          ))}
        </div>
      </div>

    </motion.div>
  );
};
