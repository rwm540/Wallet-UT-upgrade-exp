
import React from 'react';
import { Transaction } from '../types';
import { Translation, LanguageCode } from '../translations';
// Added Activity to the imports
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Clock, Search, Activity } from 'lucide-react';
import { formatNumber, formatDate } from '../utils';

interface TransactionHistoryProps {
  transactions: Transaction[];
  t: Translation;
  lang: LanguageCode;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, t, lang }) => {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-b-4 border-slate-200 min-h-[400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shadow-inner">
              <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t.historyTitle}</h2>
            <p className="text-sm text-slate-400 font-medium">{t.historySubtitle}</p>
          </div>
        </div>
        
        {transactions.length > 0 && (
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder={`${t.txId}...`} 
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all w-full md:w-64"
            />
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Clock className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-400">{t.noTransactions}</h3>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
              <thead>
                  <tr className="text-xs text-slate-400 uppercase text-start border-b border-slate-100">
                      <th className="pb-4 font-bold w-12"></th>
                      <th className="pb-4 font-bold text-start px-4">{t.type}</th>
                      <th className="pb-4 font-bold text-start px-4">{t.amount}</th>
                      <th className="pb-4 font-bold text-end px-4">{t.date}</th>
                      <th className="pb-4 font-bold text-end">{t.status}</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {transactions.slice().reverse().map(tx => (
                      <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
                                  tx.type === 'SWAP' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  tx.type === 'TRANSFER' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  'bg-green-50 text-green-600 border-green-100'
                              }`}>
                                  {tx.type === 'SWAP' && <ArrowRightLeft className="w-5 h-5" />}
                                  {tx.type === 'TRANSFER' && <ArrowUpRight className="w-5 h-5" />}
                                  {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-5 h-5" />}
                                  {(tx.type === 'STOCK_BUY' || tx.type === 'STOCK_SELL') && <Activity className="w-5 h-5" />}
                              </div>
                          </td>
                          <td className="py-5 px-4">
                              <div className="font-bold text-slate-700 text-sm">
                                  {tx.type === 'SWAP' ? t.swap : 
                                   tx.type === 'TRANSFER' ? t.transfer : 
                                   tx.type === 'DEPOSIT' ? t.deposit : 
                                   tx.type === 'STOCK_BUY' ? t.buyShares : t.sellShares}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                                  {t.txId}: {tx.id.substring(0, 12)}...
                              </div>
                          </td>
                          <td className="py-5 px-4">
                              <div className="flex flex-col">
                                <span className={`font-bold text-sm ${tx.type === 'DEPOSIT' || tx.type === 'STOCK_SELL' ? 'text-green-600' : 'text-slate-800'}`}>
                                    <span dir="ltr">{tx.type === 'DEPOSIT' || tx.type === 'STOCK_SELL' ? '+' : '-'}{formatNumber(tx.amount, lang)}</span> {tx.currency}
                                </span>
                                {tx.type === 'SWAP' && (
                                    <span className="text-xs text-emerald-500 font-bold mt-1">
                                        <span dir="ltr">+{formatNumber(tx.toAmount, lang, { maximumFractionDigits: 4 })}</span> {tx.toCurrency}
                                    </span>
                                )}
                              </div>
                          </td>
                          <td className="py-5 px-4 text-end">
                              <div className="text-sm font-bold text-slate-600">
                                {formatDate(tx.date, lang)}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(tx.date).toLocaleTimeString(lang, {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </td>
                          <td className="py-5 text-end">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-tighter">
                                  <div className="w-1 h-1 rounded-full bg-green-500 me-1.5 animate-pulse"></div>
                                  {tx.status}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
