import React, { useState } from 'react';
import { Asset } from '../types';
import { Button } from './Button';
import { ArrowRightLeft, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { ASSET_META } from '../constants';
import { Translation, LanguageCode } from '../translations';
import { formatNumber } from '../utils';
import { CustomSelect } from './CustomSelect';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  prices: Record<string, number>;
  onSwap: (from: string, to: string, amount: number) => void;
  t: Translation;
  lang: LanguageCode;
}

export const SwapModal: React.FC<SwapModalProps> = ({ 
  isOpen, 
  onClose, 
  assets, 
  prices,
  onSwap, 
  t, 
  lang 
}) => {
  const [fromAssetId, setFromAssetId] = useState<string>('BTC');
  const [toAssetId, setToAssetId] = useState<string>('UT');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const fromAsset = assets.find(a => a.id === fromAssetId);
  const toAsset = assets.find(a => a.id === toAssetId);
  
  const fromPrice = prices[fromAssetId] || fromAsset?.priceUsd || 1;
  const toPrice = prices[toAssetId] || toAsset?.priceUsd || 1;
  
  const numAmount = parseFloat(amount || '0');
  const estimatedOutput = toPrice > 0 ? (numAmount * fromPrice) / toPrice : 0;
  
  const isInsufficient = fromAsset ? numAmount > fromAsset.balance : false;
  const isSameCurrency = fromAssetId === toAssetId;

  const handleMax = () => {
    if (fromAsset) {
      setAmount(fromAsset.balance.toString());
      setError('');
    }
  };

  const handleSwap = () => {
    setError('');
    if (!amount || numAmount <= 0) {
        setError('مقدار نامعتبر است');
        return;
    }
    if (isSameCurrency) {
        setError(t.sameCurrencyError);
        return;
    }
    if (isInsufficient) {
        setError(t.insufficientFunds);
        return;
    }
    
    onSwap(fromAssetId, toAssetId, numAmount);
    onClose();
    setAmount('');
  };

  const options = assets.map(a => ({ id: a.id, name: a.name, symbol: a.symbol }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border-t-4 border-emerald-500 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                <ArrowRightLeft className="w-5 h-5" />
            </div>
            {t.modalTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pair Display */}
        <div className="flex items-center justify-center gap-4 mb-6 py-2">
            <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white"
                style={{ backgroundColor: ASSET_META[fromAssetId]?.color || '#64748b' }}
            >
                {ASSET_META[fromAssetId]?.symbol || fromAssetId}
            </div>
            <div className="h-0.5 w-12 bg-slate-200 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                </div>
            </div>
            <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white transition-all ${isSameCurrency ? 'grayscale opacity-50' : ''}`}
                style={{ backgroundColor: ASSET_META[toAssetId]?.color || '#64748b' }}
            >
                {ASSET_META[toAssetId]?.symbol || toAssetId}
            </div>
        </div>

        <div className="space-y-4">
          {/* Same Currency Warning */}
          {isSameCurrency && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    {t.sameCurrencyError}
                </p>
            </div>
          )}

          {/* From */}
          <div className={`p-4 rounded-2xl border transition-colors ${isInsufficient ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t.fromSell}</label>
            <div className="mb-3">
              <CustomSelect 
                options={options}
                value={fromAssetId}
                onChange={(val) => { setFromAssetId(val); setError(''); }}
                dir={lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="relative flex items-center gap-2" dir="ltr">
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(''); }}
                    placeholder="0.00"
                    className="bg-transparent text-2xl font-black text-slate-800 outline-none w-full"
                />
                <button 
                    type="button" 
                    onClick={handleMax}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                >
                    MAX
                </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-400">
                    ${formatNumber(fromPrice, lang, { minimumFractionDigits: 2 })} / {fromAssetId}
                </span>
                <span className={`${isInsufficient ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {t.balance}: {formatNumber(fromAsset?.balance, lang, { maximumFractionDigits: 4 })}
                </span>
            </div>
          </div>

          {/* To */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t.toBuy}</label>
            <div className="mb-3">
              <CustomSelect 
                options={options}
                value={toAssetId}
                onChange={(val) => { setToAssetId(val); setError(''); }}
                dir={lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="flex items-center justify-between" dir="ltr">
                <span className="text-2xl font-black text-emerald-600">
                    {formatNumber(estimatedOutput, lang, { maximumFractionDigits: 4 })}
                </span>
                <span className="text-xs font-mono text-slate-400">
                    ${formatNumber(toPrice, lang, { minimumFractionDigits: 2 })} / {toAssetId}
                </span>
            </div>
          </div>

          {error && <p className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-100">{error}</p>}
        </div>

        <div className="mt-6">
            <Button 
                fullWidth 
                variant="primary" 
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-800 py-3.5"
                onClick={handleSwap}
                disabled={isInsufficient || isSameCurrency}
            >
                {t.confirmConversion}
            </Button>
        </div>
      </div>
    </div>
  );
};
