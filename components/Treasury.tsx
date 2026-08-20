import React from 'react';
import { ASSET_META, INITIAL_TREASURY_RESERVES } from '../constants';
import { Building2, ShieldCheck, Scale, Info, Layers, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Translation, LanguageCode } from '../translations';
import { formatNumber } from '../utils';
import { calculateUTBackedPrice } from '../services/priceService';
import { motion } from 'motion/react';

interface TreasuryProps {
  t: Translation;
  lang: LanguageCode;
  prices: Record<string, number>;
  reserves?: Record<string, number>;
  circulatingUT?: number;
}

export const Treasury: React.FC<TreasuryProps> = ({ 
  t, 
  lang, 
  prices, 
  reserves = INITIAL_TREASURY_RESERVES,
  circulatingUT = 3000000,
}) => {
  const { utPrice, totalReserveValueUSD, reserveBreakdown } = calculateUTBackedPrice(
    reserves,
    prices,
    circulatingUT
  );

  const chartData = reserveBreakdown.map(item => ({
    name: ASSET_META[item.id]?.fullName || item.id,
    shortName: item.id,
    value: Math.round(item.valueUSD),
    amount: item.amount,
    unit: ASSET_META[item.id]?.unit || '',
    percentage: Number(item.percentage.toFixed(1)),
    color: ASSET_META[item.id]?.color || '#3b82f6'
  }));

  const backingRatio = circulatingUT > 0 ? (totalReserveValueUSD / (circulatingUT * utPrice)) * 100 : 100;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-b-4 border-slate-200 mb-8 relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 start-0 w-full h-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-600/25">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 flex-wrap">
              <span>{t.treasuryTitle}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Backed Collateral
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.treasurySubtitle}</p>
          </div>
        </div>

        {/* UT Valuation Live Metric Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-sky-50/80 border border-emerald-200/80 rounded-2xl p-4 text-end min-w-[220px] shadow-sm">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-end gap-1">
            <Scale className="w-3.5 h-3.5" /> {t.nativeCategory}
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-0.5" dir="ltr">
            1 UT = ${formatNumber(utPrice, lang, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USD
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {t.backingRatio}: <span className="font-bold text-emerald-600">{backingRatio.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Vault Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.backingValue}</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">طلای فیزیکی و ذخایر امن</span>
          </div>
          <span className="text-2xl font-black text-slate-900" dir="ltr">
            ${formatNumber(totalReserveValueUSD, lang, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">مجموع ارزش دلاری وثایق قفل شده در خزانه</span>
        </div>

        <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.utReserve}</span>
            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">در گردش</span>
          </div>
          <span className="text-2xl font-black text-sky-700" dir="ltr">
            {formatNumber(circulatingUT, lang, { maximumFractionDigits: 0 })} UT
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">کل توکن‌های صادر شده با پوشش ۱۰۰٪</span>
        </div>
      </div>

      {/* Transparency Guarantee Banner (Emerald & Sky Gradient) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-700 text-white rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3 shadow-md border-b-2 border-emerald-900">
        <Info className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-bold text-sky-200 block mb-1">شفافیت ۱۰۰٪ و ارزش‌گذاری الگوریتمی وثیقه‌محور:</span>
          <p className="text-emerald-50">{t.reserveFormulaDesc}</p>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Chart */}
        <div className="lg:col-span-5 h-64 w-full relative" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val: number) => [`$${val.toLocaleString()} USD`, 'Collateral Value']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-400">Vault Total</span>
            <span className="text-base font-black text-slate-800">
              ${(totalReserveValueUSD / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="lg:col-span-7 space-y-2.5">
          <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>{t.backedBy} (تفکیک سبد دارایی‌های ذخیره)</span>
            <span className="text-xs text-slate-400 font-normal">{chartData.length} دارایی پشتیبان</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {chartData.map((item) => (
              <div 
                key={item.shortName}
                className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-3 rounded-2xl border border-slate-100 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">
                      {item.shortName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {formatNumber(item.amount, lang)} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="text-end">
                  <span className="font-extrabold text-xs text-slate-700 block" dir="ltr">
                    ${formatNumber(item.value, lang)}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
