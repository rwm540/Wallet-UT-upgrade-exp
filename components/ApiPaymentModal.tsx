import React, { useState } from 'react';
import { UserState, Transaction } from '../types';
import { 
  X, 
  Key, 
  Copy, 
  Check, 
  ArrowDownRight, 
  ArrowUpRight, 
  Code, 
  Terminal, 
  Play, 
  ShieldCheck,
  CreditCard,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { formatNumber } from '../utils';
import { LanguageCode } from '../translations';

interface ApiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserState;
  onUpdateUser: (updater: (prev: UserState) => UserState) => void;
  lang: LanguageCode;
}

export const ApiPaymentModal: React.FC<ApiPaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'docs' | 'logs'>('overview');
  const [apiKey, setApiKey] = useState('ut_pay_live_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36));
  const [copiedKey, setCopiedKey] = useState(false);

  // Deposit test state
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositRefId, setDepositRefId] = useState('INV-' + Math.floor(100000 + Math.random() * 900000));
  const [depositStatus, setDepositStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Withdraw test state
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [withdrawDestination, setWithdrawDestination] = useState('IR920180000000123456789012');
  const [withdrawStatus, setWithdrawStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // API Logs state
  const [apiLogs, setApiLogs] = useState<Array<{ id: string; type: 'deposit' | 'withdraw'; amount: number; ref: string; timestamp: number; status: string }>>([
    { id: 'log-1', type: 'deposit', amount: 250, ref: 'INV-883921', timestamp: Date.now() - 3600000, status: 'SUCCESS' },
    { id: 'log-2', type: 'withdraw', amount: 100, ref: 'WD-994821', timestamp: Date.now() - 7200000, status: 'SUCCESS' }
  ]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleRegenerateKey = () => {
    if (confirm('آیا از بازنشانی کلید API اطمینان دارید؟ کلید قبلی غیرفعال خواهد شد.')) {
      setApiKey('ut_pay_live_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36));
    }
  };

  const handleRunDepositTest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepositStatus({ success: false, message: 'لطفاً مبلغ معتبری وارد کنید.' });
      return;
    }

    // Update user UT balance
    onUpdateUser(prev => {
      const updatedAssets = prev.assets.map(a => {
        if (a.id === 'UT') {
          return { ...a, balance: a.balance + amt };
        }
        return a;
      });
      const newTx: Transaction = {
        id: 'tx-api-dep-' + Date.now(),
        type: 'buy',
        assetId: 'UT',
        assetSymbol: 'UT',
        amount: amt,
        priceUsd: amt * 1.5,
        timestamp: Date.now(),
        status: 'completed',
        hash: '0xapi' + Math.random().toString(36).substr(2, 8)
      };
      return {
        ...prev,
        assets: updatedAssets,
        transactions: [newTx, ...prev.transactions]
      };
    });

    const newLog = {
      id: 'log-' + Date.now(),
      type: 'deposit' as const,
      amount: amt,
      ref: depositRefId,
      timestamp: Date.now(),
      status: 'SUCCESS'
    };
    setApiLogs(prev => [newLog, ...prev]);

    setDepositStatus({ success: true, message: `واریز ${amt} UT با موفقیت از طریق درگاه API انجام شد و به کیف پول اضافه گردید.` });
    setDepositRefId('INV-' + Math.floor(100000 + Math.random() * 900000));
  };

  const handleRunWithdrawTest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawStatus({ success: false, message: 'لطفاً مبلغ معتبری وارد کنید.' });
      return;
    }

    const nativeAsset = user.assets.find(a => a.id === 'UT');
    const currentBalance = nativeAsset ? nativeAsset.balance : 0;

    if (currentBalance < amt) {
      setWithdrawStatus({ success: false, message: 'موجودی UT کیف پول شما برای این برداشت کافی نیست.' });
      return;
    }

    // Deduct user UT balance
    onUpdateUser(prev => {
      const updatedAssets = prev.assets.map(a => {
        if (a.id === 'UT') {
          return { ...a, balance: a.balance - amt };
        }
        return a;
      });
      const newTx: Transaction = {
        id: 'tx-api-wd-' + Date.now(),
        type: 'sell',
        assetId: 'UT',
        assetSymbol: 'UT',
        amount: amt,
        priceUsd: amt * 1.5,
        timestamp: Date.now(),
        status: 'completed',
        hash: '0xwd' + Math.random().toString(36).substr(2, 8)
      };
      return {
        ...prev,
        assets: updatedAssets,
        transactions: [newTx, ...prev.transactions]
      };
    });

    const newLog = {
      id: 'log-' + Date.now(),
      type: 'withdraw' as const,
      amount: amt,
      ref: 'WD-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: Date.now(),
      status: 'SUCCESS'
    };
    setApiLogs(prev => [newLog, ...prev]);

    setWithdrawStatus({ success: true, message: `برداشت ${amt} UT با موفقیت از طریق API ثبت و به مقصد تسویه شد.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 px-4 sm:px-6 py-4 flex items-start sm:items-center justify-between text-white gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300 shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight leading-tight">سامانه API Payment و درگاه بانکی</h2>
              <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">مدیریت کلیدهای API، تست واریز و برداشت اتوماتیک</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Subheader Navigation Tabs */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            کلید API و تنظیمات
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'deposit' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            تست API واریز (Deposit)
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'withdraw' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            تست API برداشت (Withdraw)
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'docs' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            راهنمای مستندات
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            گزارش تراکنش‌ها ({apiLogs.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50" dir="rtl">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 leading-tight">
                    <Key className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>کلید اختصاصی درگاه پرداخت (Merchant API Key)</span>
                  </h3>
                  <button
                    onClick={handleRegenerateKey}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap w-full sm:w-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تولید کلید جدید</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 font-mono text-xs sm:text-sm text-slate-800 font-bold text-center sm:text-left"
                    dir="ltr"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20 shrink-0 whitespace-nowrap"
                  >
                    {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'کپی شد!' : 'کپی کلید'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  * از این کلید در هدر درخواست‌های HTTP با نام <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-emerald-700 font-bold">Authorization: Bearer &lt;API_KEY&gt;</code> برای اتصال وبسایت یا ربات خود به درگاه واریز و برداشت UT استفاده کنید.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>اندپوینت واریز (Deposit API)</span>
                  </div>
                  <code className="block bg-white border border-emerald-200/80 p-2.5 rounded-xl text-xs font-mono text-emerald-900" dir="ltr">
                    POST /api/v1/payment/deposit
                  </code>
                  <p className="text-[11px] text-emerald-700">برای ایجاد فاکتور و افزایش اتوماتیک موجودی UT کیف پول کاربر.</p>
                </div>

                <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-teal-800 font-black text-xs">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>اندپوینت برداشت (Withdraw API)</span>
                  </div>
                  <code className="block bg-white border border-teal-200/80 p-2.5 rounded-xl text-xs font-mono text-teal-900" dir="ltr">
                    POST /api/v1/payment/withdraw
                  </code>
                  <p className="text-[11px] text-teal-700">برای ارسال درخواست تسویه و برداشت UT به حساب مقصد.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPOSIT TEST */}
          {activeTab === 'deposit' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                <span>شبیه‌ساز و تست API واریز (Deposit)</span>
              </div>
              <p className="text-xs text-slate-500">
                این فرم درخواست واریز از طریق درگاه API را شبیه‌سازی کرده و مبلغ UT را فوراً به موجودی کیف پول شما اضافه می‌کند.
              </p>

              <form onSubmit={handleRunDepositTest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ واریزی (UT)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">شناسه فاکتور (Reference ID)</label>
                    <input
                      type="text"
                      value={depositRefId}
                      onChange={(e) => setDepositRefId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>اجرای تست درخواست واریز API</span>
                </button>
              </form>

              {depositStatus && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  depositStatus.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{depositStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAW TEST */}
          {activeTab === 'withdraw' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <ArrowUpRight className="w-4 h-4 text-teal-600" />
                <span>شبیه‌ساز و تست API برداشت (Withdrawal)</span>
              </div>
              <p className="text-xs text-slate-500">
                این فرم درخواست برداشت از طریق API را شبیه‌سازی کرده و مبلغ UT را از کیف پول شما کسر می‌نماید.
              </p>

              <form onSubmit={handleRunWithdrawTest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ برداشت (UT)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">شماره حساب یا آدرس مقصد</label>
                    <input
                      type="text"
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>اجرای تست درخواست برداشت API</span>
                </button>
              </form>

              {withdrawStatus && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  withdrawStatus.success ? 'bg-teal-50 border border-teal-200 text-teal-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{withdrawStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOCS */}
          {activeTab === 'docs' && (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <span>نمونه کد cURL برای اتصال به درگاه</span>
              </h3>
              
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto" dir="ltr">
                <pre>{`curl -X POST https://api.chatwallet.app/v1/payment/deposit \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 100, "currency": "UT", "reference_id": "INV-12345"}'`}</pre>
              </div>

              <h3 className="text-sm font-black text-slate-800 pt-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-600" />
                <span>نمونه کد JavaScript / Node.js</span>
              </h3>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto" dir="ltr">
                <pre>{`const response = await fetch('https://api.chatwallet.app/v1/payment/withdraw', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ amount: 50, destination: 'IR9201800...' })
});
const result = await response.json();
console.log(result);`}</pre>
              </div>
            </div>
          )}

          {/* TAB 5: LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-black text-xs text-slate-700">
                تاریخچه درخواست‌های درگاه API
              </div>
              <div className="divide-y divide-slate-100">
                {apiLogs.map(log => (
                  <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        log.type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {log.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {log.type === 'deposit' ? 'واریز از طریق API' : 'برداشت از طریق API'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">شناسه: {log.ref} | {new Date(log.timestamp).toLocaleTimeString('fa-IR')}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`font-mono font-bold block ${log.type === 'deposit' ? 'text-emerald-600' : 'text-teal-600'}`}>
                        {log.type === 'deposit' ? '+' : '-'}{log.amount} UT
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-right">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
            * سامانه درگاه بانکی هوشمند UT متصل به حساب کاربری شماست.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
