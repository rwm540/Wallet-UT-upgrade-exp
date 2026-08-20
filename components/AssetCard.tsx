import React, { useState } from 'react';
import { Asset } from '../types';
import { Copy, Check, TrendingUp, TrendingDown, Send, ArrowRightLeft } from 'lucide-react';
import { Translation, LanguageCode } from '../translations';
import { formatNumber, formatTokenPrice } from '../utils';
import { ASSET_META } from '../constants';
import { UT_BASE_FLOOR_PRICE } from '../services/priceService';

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
  onTransfer?: (assetId: string) => void;
  onSwap?: (assetId: string) => void;
  t: Translation;
  lang: LanguageCode;
  utPrice?: number;
}

export const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, 
  onClick, 
  onTransfer,
  onSwap,
  t, 
  lang, 
  utPrice = 1 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransferClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTransfer) {
      onTransfer(asset.id);
    } else if (onClick) {
      onClick();
    }
  };

  const handleSwapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSwap) {
      onSwap(asset.id);
    }
  };

  const isPositive = (asset.change24h ?? 0) >= 0;
  const isMetal = asset.category === 'metals';
  const isUT = asset.id === 'UT';

  // Pair symbol: e.g. "Gold", "Silver", "Palladium", "BTC", "ETH", "TRX", "POL", "UT"
  const pairSymbol = ASSET_META[asset.id]?.pairSymbol || asset.id;

  // Mathematically exact rate in UT:
  // If 1 Gold = $2,924.80 USD, and 1 UT = $3.2302 USD:
  // 1 Gold = 2,924.80 / 3.2302 = 905.4547 UT
  const validUtPrice = utPrice > 0 ? utPrice : 1;
  const rateInUT = isUT ? 1 : (asset.priceUsd / validUtPrice);

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-3xl p-5 border-b-4 border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
        isUT ? 'ring-2 ring-emerald-500/40' : ''
      }`}
    >
      {/* Top gradient highlight for UT & Metals */}
      {isUT && (
        <div className="absolute top-0 start-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"></div>
      )}
      {isMetal && (
        <div className="absolute top-0 start-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-slate-400"></div>
      )}

      {/* Decorative Background Glow */}
      <div 
        className="absolute -end-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-125"
        style={{ backgroundColor: asset.color }}
      />

      <div>
        {/* Header Info */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md font-bold text-lg transition-transform group-hover:scale-105 shrink-0"
              style={{ backgroundColor: asset.color }}
            >
              {asset.symbol}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-800 text-base">{asset.name}</h3>
                {isUT && (
                  <span className="p-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black px-1.5 border border-emerald-200">
                    100% BACKED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-bold text-slate-400" dir="ltr">
                  {asset.id}
                </span>
                {asset.change24h !== undefined && (
                  <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}>
                    {isPositive ? <TrendingUp className="w-2.5 h-2.5 me-0.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 me-0.5 inline" />}
                    {isPositive ? `+${asset.change24h.toFixed(2)}%` : `${asset.change24h.toFixed(2)}%`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-end">
            {isUT ? (
              <>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                  موجودی کیف پول
                </span>
                <p className="font-black text-xl text-emerald-950" dir="ltr">
                  {formatNumber(asset.balance, lang, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  <span className="text-xs font-bold text-emerald-700 ms-1">UT</span>
                </p>
                <p className="text-xs font-bold text-slate-500 mt-0.5" dir="ltr">
                  ≈ ${formatNumber(asset.balance * asset.priceUsd, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-end gap-1.5" dir="ltr">
                  <span className="text-[11px] font-extrabold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    {pairSymbol}/UT
                  </span>
                  <span className="font-black text-sm sm:text-base text-slate-900 font-mono">
                    {formatNumber(rateInUT, lang, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: rateInUT < 1 ? 4 : 2 
                    })}
                    <span className="text-xs font-bold text-sky-700 ms-1">UT</span>
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5" dir="ltr">
                  <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {pairSymbol}/USD
                  </span>
                  <span className="font-bold text-xs text-slate-700 font-mono">
                    ${formatNumber(asset.priceUsd, lang, { 
                      minimumFractionDigits: asset.priceUsd < 1 ? 4 : 2, 
                      maximumFractionDigits: asset.priceUsd < 1 ? 4 : 2 
                    })}
                    <span className="text-[10px] text-slate-400 ms-1">USD</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Valuation Pair Row */}
        <div className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-xl mb-3 border border-emerald-100">
          <span className="text-[11px] text-slate-600 font-bold">
            {isUT ? 'جفت‌ارز پایه و پشتوانه:' : 'ارزش تبادل لحظه‌ای:'}
          </span>
          <span className="text-xs font-mono font-black text-slate-800" dir="ltr">
            {isUT ? (
              <span className="text-emerald-950 font-bold">
                1 UT = ${formatTokenPrice(asset.priceUsd, lang)} USD
              </span>
            ) : (
              <span className="text-emerald-900 font-bold">
                1 {pairSymbol} = {formatNumber(rateInUT, lang, { minimumFractionDigits: 2, maximumFractionDigits: rateInUT < 1 ? 4 : 2 })} UT
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {/* Dedicated In-Card Action Buttons (Transfer & Swap) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleTransferClick}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 border ${
              isUT 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-700 shadow-emerald-700/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 shadow-emerald-700/20'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.transfer}</span>
          </button>

          <button
            type="button"
            onClick={handleSwapClick}
            className="py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.swap}</span>
          </button>
        </div>

        {/* Address Hash Row */}
        <div className="bg-slate-50/70 rounded-xl p-2 flex items-center justify-between border border-slate-100 relative group/copy">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t.accountNo}</span>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-slate-600 font-bold truncate max-w-[130px]" dir="ltr">
              {asset.accountNumber}
            </code>
            <button 
              type="button"
              onClick={handleCopy}
              className="p-1 hover:bg-slate-200/80 rounded-lg transition-colors"
              title="Copy Hash Address"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 animate-in fade-in scale-in duration-200" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
