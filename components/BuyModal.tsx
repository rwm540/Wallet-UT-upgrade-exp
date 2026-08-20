import React, { useState } from 'react';
import { Asset } from '../types';
import { Button } from './Button';
import { ShoppingCart, X, CreditCard, AlertCircle } from 'lucide-react';
import { Translation, LanguageCode } from '../translations';
import { formatNumber, formatTokenPrice } from '../utils';
import { CustomSelect } from './CustomSelect';
import { ASSET_META } from '../constants';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onBuy: (assetId: string, amount: number, totalCost: number) => void;
  t: Translation;
  lang: LanguageCode;
  walletType: string | null;
  externalBalance: number;
}

export const BuyModal: React.FC<BuyModalProps> = ({ 
  isOpen, 
  onClose, 
  assets, 
  onBuy, 
  t, 
  lang, 
  walletType,
  externalBalance 
}) => {
  const [assetId, setAssetId] = useState<string>('UT');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const selectedAsset = assets.find(a => a.id === assetId);
  const pairSymbol = ASSET_META[assetId]?.pairSymbol || assetId;
  const price = selectedAsset?.priceUsd || 1;
  const numAmount = parseFloat(amount || '0');
  const totalCost = numAmount * price;
  const isInsufficient = totalCost > externalBalance;

  const handleBuy = () => {
    setError('');
    if (!amount || numAmount <= 0) {
      setError('مقدار نامعتبر است');
      return;
    }

    if (isInsufficient) {
      setError(t.insufficientExternalFunds);
      return;
    }

    onBuy(assetId, numAmount, totalCost);
    onClose();
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border-t-4 border-emerald-500 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            {t.buyTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-extrabold text-slate-500 uppercase">{t.externalWalletBalance}</label>
              <span className="text-xs font-bold text-emerald-700 font-mono" dir="ltr">{walletType?.toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-slate-800" dir="ltr">
                ${formatNumber(externalBalance, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <CustomSelect 
              label={t.toBuy}
              options={assets.map(a => ({ id: a.id, name: a.name, symbol: a.symbol }))}
              value={assetId}
              onChange={setAssetId}
              dir={lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className="flex justify-between items-center text-xs text-slate-600 mt-2.5 px-1 font-mono" dir="ltr">
              <span className="font-bold">{pairSymbol}/USD:</span>
              <span className="font-bold text-slate-800">
                1 {pairSymbol} = ${formatTokenPrice(price, lang)} USD
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-extrabold text-slate-500 uppercase mb-2 block">{t.amount}</label>
            <div className="flex items-center gap-2" dir="ltr">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder="0.00"
                className="bg-transparent text-2xl font-black text-slate-800 outline-none w-full"
              />
              <span className="font-bold text-slate-600">{pairSymbol}</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
            isInsufficient ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div>
              <span className={`text-[11px] font-extrabold uppercase block ${isInsufficient ? 'text-rose-500' : 'text-emerald-700'}`}>
                {t.totalCost} (USD)
              </span>
              <span className={`text-xl font-black ${isInsufficient ? 'text-rose-700' : 'text-emerald-900'}`} dir="ltr">
                ${formatNumber(totalCost, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            {isInsufficient && <AlertCircle className="w-5 h-5 text-rose-500" />}
          </div>
          
          {error && <p className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-100">{error}</p>}
        </div>

        <div className="mt-6">
          <Button 
            fullWidth 
            variant="primary" 
            className={`py-3.5 ${isInsufficient ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800'}`} 
            onClick={handleBuy}
            disabled={isInsufficient}
          >
            {t.confirmBuy}
          </Button>
        </div>
      </div>
    </div>
  );
};
