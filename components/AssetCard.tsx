import React, { useState } from 'react';
import { Asset } from '../types';
import { Copy, Check, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { Translation, LanguageCode } from '../translations';
import { formatNumber } from '../utils';

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
  t: Translation;
  lang: LanguageCode;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, t, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPositive = (asset.change24h ?? 0) >= 0;
  const isMetal = asset.category === 'metals';
  const isUT = asset.id === 'UT';

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-3xl p-5 border-b-4 border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${
        isUT ? 'ring-2 ring-blue-500/30' : ''
      }`}
    >
      {/* Top gradient highlight for UT & Metals */}
      {isUT && (
        <div className="absolute top-0 start-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"></div>
      )}
      {isMetal && (
        <div className="absolute top-0 start-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-slate-400"></div>
      )}

      {/* Decorative Background Glow */}
      <div 
        className="absolute -end-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-125"
        style={{ backgroundColor: asset.color }}
      />

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
                <span className="p-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black px-1.5" title={t.backingRatio}>
                  BACKED
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
          <p className="font-black text-lg text-slate-800" dir="ltr">
            {formatNumber(asset.balance, lang, { maximumFractionDigits: asset.category === 'metals' || asset.id === 'BTC' ? 4 : 2 })}
            <span className="text-xs font-semibold text-slate-400 ms-1">{asset.unit || asset.symbol}</span>
          </p>
          <p className="text-xs font-bold text-slate-500 mt-0.5" dir="ltr">
            ≈ ${formatNumber(asset.balance * asset.priceUsd, lang, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Real Live USD Unit Price Row */}
      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl mb-3 border border-slate-100/80">
        <span className="text-[11px] text-slate-400 font-semibold">{t.pricePerUnit}:</span>
        <span className="text-xs font-mono font-bold text-slate-700" dir="ltr">
          ${formatNumber(asset.priceUsd, lang, { 
            minimumFractionDigits: asset.priceUsd < 1 ? 4 : 2, 
            maximumFractionDigits: asset.priceUsd < 1 ? 4 : 2 
          })}
          <span className="text-[10px] text-slate-400 ms-1">USD</span>
        </span>
      </div>

      {/* Address Hash Row */}
      <div className="bg-slate-50/60 rounded-xl p-2 flex items-center justify-between border border-slate-100 relative group/copy">
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
  );
};
