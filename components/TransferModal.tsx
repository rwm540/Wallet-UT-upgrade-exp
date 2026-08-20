import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { Button } from './Button';
import { Send, X, Wallet, Shield } from 'lucide-react';
import { Translation, LanguageCode } from '../translations';
import { formatNumber } from '../utils';
import { CustomSelect } from './CustomSelect';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onTransfer: (assetId: string, amount: number, address: string) => void;
  t: Translation;
  lang: LanguageCode;
  defaultAssetId?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({ 
  isOpen, 
  onClose, 
  assets, 
  onTransfer, 
  t, 
  lang, 
  defaultAssetId 
}) => {
  const [assetId, setAssetId] = useState<string>('UT');
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAssetId(defaultAssetId || 'UT');
    }
  }, [isOpen, defaultAssetId]);

  if (!isOpen) return null;

  const selectedAsset = assets.find(a => a.id === assetId);
  const isShare = assetId === 'UTF';

  const handleTransfer = () => {
    setError('');
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      setError('مقدار نامعتبر است');
      return;
    }
    if (selectedAsset && numAmount > selectedAsset.balance) {
      setError(t.insufficientFunds);
      return;
    }
    if (!address || address.trim().length < 4) {
      setError('آدرس یا شماره حساب مقصد نامعتبر است');
      return;
    }

    onTransfer(assetId, numAmount, address.trim());
    onClose();
    setAmount('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border-t-4 border-teal-500 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
              <Send className="w-5 h-5" />
            </div>
            {t.transferTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <CustomSelect 
              label={t.yourAssets}
              options={assets.map(a => ({ id: a.id, name: a.name, symbol: a.symbol }))}
              value={assetId}
              onChange={setAssetId}
              dir={lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <p className="text-xs text-slate-500 font-medium mt-2 px-1 text-start">
              {t.balance}: <span className="font-bold text-slate-800" dir="ltr">{formatNumber(selectedAsset?.balance, lang, { maximumFractionDigits: 4 })}</span> {selectedAsset?.symbol || selectedAsset?.id}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-extrabold text-slate-500 uppercase mb-2 block">
              {isShare ? t.shares : t.amount}
            </label>
            <div className="flex items-center gap-2" dir="ltr">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder={isShare ? "0" : "0.00"}
                className="bg-transparent text-2xl font-black text-slate-800 outline-none w-full"
              />
              <span className="font-bold text-slate-500">{selectedAsset?.symbol || selectedAsset?.id}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-extrabold text-slate-500 uppercase mb-2 block">{t.recipientAddress}</label>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={address}
                onChange={(e) => { setAddress(e.target.value); setError(''); }}
                placeholder="0x... or Hash ID"
                className="bg-transparent text-sm font-mono font-bold text-slate-800 outline-none w-full"
                dir="ltr"
              />
            </div>
          </div>
          
          {error && <p className="text-rose-600 text-xs font-bold text-center bg-rose-50 p-2.5 rounded-xl border border-rose-100">{error}</p>}
        </div>

        <div className="mt-6">
          <Button fullWidth variant="primary" className="py-3.5" onClick={handleTransfer}>
            {t.confirmTransfer}
          </Button>
        </div>
      </div>
    </div>
  );
};
