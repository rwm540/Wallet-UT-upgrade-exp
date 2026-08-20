import React, { useState } from 'react';
import { Button } from './Button';
import { ShieldCheck, Wallet, X, Loader2, ChevronRight, Lock } from 'lucide-react';
import { Translation } from '../translations';

interface LoginProps {
  onLogin: (type: 'metamask' | 'trust') => void;
  t: Translation;
}

// Crisp Vector Icon for MetaMask
export const MetaMaskIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M274.1 35.5L174.6 109.4l18.4-43.6z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44.5 35.5l98.6 74.6-17.7-44.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M238.3 206.8l-26.4 40.8 56.7 15.6 16.3-55.6z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M33.8 207.6l16.2 55.6 56.6-15.6-26.4-40.8z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M98.6 138.8l-18.7 28.2 66.7 3 2.1-51.5z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M220 138.8l-50.5-20.7 2 51.5 66.8-3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M106.6 247.6l33.8-16.5-29.2-22.8z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M178.2 231.1l33.8 16.5-4.6-39.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M212 247.6l-33.8-16.5 3.1 23.3.4 9.8 45.4-1.2z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M106.6 247.6l-15.1 15.4 45.4 1.2.4-9.8 3.1-23.3z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M140.4 189.6l-38.1-11.2 26.9-12.4 11.2 23.6z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M178.2 189.6l11.2-23.6 26.9 12.4-38.1 11.2z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M106.6 247.6l3.8-39.7-30.2 1.3z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M208.2 207.9l3.8 39.7 26.4-38.4z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M220 138.8l-41.8 50.8 3.8-23.6 26.9-12.4z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M140.4 189.6l-41.8-50.8 14.9 14.8 26.9 12.4z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M98.6 138.8l20.4 40.8-20.4-12.6z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M220 138.8l-20.4 28.2 20.4-28.2z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M178.2 189.6l-18.9 37.1 1.9 4.4 20.8-41.5z" fill="#146A36" stroke="#146A36" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M140.4 189.6l-3.8 41.5 2 4.4 18.9-45.9z" fill="#146A36" stroke="#146A36" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M274.1 35.5l-9.8 73.9-44.3 29.4 54.1-103.3z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44.5 35.5l54.1 103.3-44.3-29.4z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M80.2 167l26.4 40.8-30.2 1.3z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M212 207.9l26.4-40.8 3.8 39.5z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M174.6 109.4l45.4 29.4-41.8 50.8-18.9-45.9z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M98.6 138.8l45.4-29.4 15.3 34.3-18.9 45.9z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M174.6 109.4l-15.3 34.3-15.3-34.3 15.3-43.6z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M159.3 65.8l15.3 43.6 45.4-29.4z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M98.6 138.8l45.4-29.4 15.3-43.6-60.7 73z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Crisp Vector Icon for Trust Wallet
export const TrustWalletIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#0500FF" fillOpacity="0.1" />
    <path 
      d="M50 16C64 21.5 78 23 78 23V50C78 68 64 80 50 85C36 80 22 68 22 50V23C22 23 36 21.5 50 16Z" 
      fill="url(#tw-gradient)" 
    />
    <path 
      d="M50 25C60 29 70 30.5 70 30.5V49C70 63 59 72 50 76C41 72 30 63 30 49V30.5C30 30.5 40 29 50 25Z" 
      fill="#FFFFFF" 
    />
    <path 
      d="M50 33C56 35.5 63 36.5 63 36.5V48C63 57 56 64 50 67C44 64 37 57 37 48V36.5C37 36.5 44 35.5 50 33Z" 
      fill="#0500FF" 
    />
    <defs>
      <linearGradient id="tw-gradient" x1="50" y1="16" x2="50" y2="85" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0500FF" />
        <stop offset="1" stopColor="#0047FF" />
      </linearGradient>
    </defs>
  </svg>
);

export const Login: React.FC<LoginProps> = ({ onLogin, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectingType, setConnectingType] = useState<'metamask' | 'trust' | null>(null);

  const handleSelectWallet = (type: 'metamask' | 'trust') => {
    setConnectingType(type);
    // Simulate wallet connection handshake
    setTimeout(() => {
      onLogin(type);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Login Card */}
      <div 
        id="login-card"
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-b-8 border-emerald-100 text-center relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/10"
      >
        {/* Decorative background blurs */}
        <div className="absolute top-0 start-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"></div>
        <div className="absolute -start-10 -bottom-10 w-40 h-40 bg-sky-100 rounded-full opacity-60 blur-xl pointer-events-none"></div>
        <div className="absolute -end-10 -top-10 w-40 h-40 bg-emerald-100 rounded-full opacity-60 blur-xl pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo badge */}
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-emerald-500/30 shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
            <span className="text-3xl font-black text-white">UT</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{t.appName}</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">{t.appDesc}</p>

          {/* Single Connect Wallet Button as requested */}
          <div className="space-y-4">
            <Button 
              id="connect-wallet-trigger-btn"
              fullWidth 
              variant="primary" 
              onClick={() => setIsModalOpen(true)}
              className="py-4 text-base font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wallet className="w-5 h-5 text-white/90" />
              <span>{t.connectWallet}</span>
            </Button>
          </div>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t.secureBadge}</span>
          </div>
        </div>
      </div>

      {/* Animated Wallet Selection Modal Window */}
      {isModalOpen && (
        <div 
          id="wallet-selection-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => !connectingType && setIsModalOpen(false)}
          />

          {/* Modal Container with entrance animation */}
          <div 
            className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-b-8 border-slate-100 text-start z-10 transform transition-all duration-300 animate-in zoom-in-95 fade-in slide-in-from-bottom-4"
          >
            {/* Top decorative line */}
            <div className="absolute top-0 start-0 w-full h-2 rounded-t-3xl bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{t.selectWallet}</h2>
                </div>
              </div>

              <button
                id="close-wallet-modal-btn"
                onClick={() => !connectingType && setIsModalOpen(false)}
                disabled={connectingType !== null}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6 ps-1 leading-relaxed">
              {t.selectWalletDesc}
            </p>

            {/* Wallet Selection Options */}
            <div className="space-y-3.5">
              {/* Option 1: Trust Wallet */}
              <button
                id="select-trust-wallet-btn"
                onClick={() => handleSelectWallet('trust')}
                disabled={connectingType !== null}
                className={`w-full group text-start p-4 rounded-2xl border-2 transition-all flex items-center justify-between relative overflow-hidden ${
                  connectingType === 'trust'
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-100 bg-slate-50/80 hover:bg-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                    <TrustWalletIcon className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors text-base">
                      {t.connectTrust}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                      Trust Wallet • Multi-Chain
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {connectingType === 'trust' ? (
                    <div className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.connecting}</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200/60 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                      <ChevronRight className="w-4 h-4 transform rtl:rotate-180" />
                    </div>
                  )}
                </div>
              </button>

              {/* Option 2: MetaMask */}
              <button
                id="select-metamask-wallet-btn"
                onClick={() => handleSelectWallet('metamask')}
                disabled={connectingType !== null}
                className={`w-full group text-start p-4 rounded-2xl border-2 transition-all flex items-center justify-between relative overflow-hidden ${
                  connectingType === 'metamask'
                    ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-100 bg-slate-50/80 hover:bg-white hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                    <MetaMaskIcon className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors text-base">
                      {t.connectMetamask}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                      MetaMask • EVM & Web3
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {connectingType === 'metamask' ? (
                    <div className="flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.connecting}</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200/60 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                      <ChevronRight className="w-4 h-4 transform rtl:rotate-180" />
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Footer Information */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Web3 Encrypted Protocol</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={connectingType !== null}
                className="text-slate-500 hover:text-slate-800 font-bold transition-colors disabled:opacity-40"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
