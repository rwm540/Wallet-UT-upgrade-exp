import React, { useState, useMemo } from 'react';
import { ASSET_META, INITIAL_TREASURY_RESERVES } from '../constants';
import { 
  Building2, 
  ShieldCheck, 
  Scale, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShoppingCart, 
  ArrowLeftRight, 
  Activity, 
  Percent, 
  Layers, 
  Calculator, 
  Sparkles,
  Zap,
  Clock,
  UserCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Translation, LanguageCode } from '../translations';
import { formatNumber, formatTokenPrice } from '../utils';
import { calculateUTBackedPrice, UT_TOTAL_SUPPLY, UT_BASE_FLOOR_PRICE } from '../services/priceService';
import { Transaction } from '../types';

interface TreasuryProps {
  t: Translation;
  lang: LanguageCode;
  prices: Record<string, number>;
  reserves?: Record<string, number>;
  circulatingUT?: number;
  userTransactions?: Transaction[];
}

interface SimulatedTrade {
  id: string;
  userLine: string;
  type: 'BUY' | 'SELL';
  amountUT: number;
  valueUSD: number;
  pricePerTokenUSD: number;
  priceImpactPercent: number;
  timestamp: number;
}

export const Treasury: React.FC<TreasuryProps> = ({ 
  t, 
  lang, 
  prices, 
  reserves = INITIAL_TREASURY_RESERVES,
  circulatingUT = UT_TOTAL_SUPPLY,
  userTransactions = []
}) => {
  const { utPrice, totalReserveValueUSD, reserveBreakdown, baseFloorPrice, backingMultiplier } = calculateUTBackedPrice(
    reserves,
    prices,
    circulatingUT
  );

  // Simulator state for user price impact testing
  const [simAmountUT, setSimAmountUT] = useState<number>(500000);
  const [simTradeType, setSimTradeType] = useState<'BUY' | 'SELL'>('BUY');

  // Baseline simulated network trades augmented with real user transactions
  const baseSimulatedTrades: SimulatedTrade[] = useMemo(() => [
    {
      id: 'TRD-8941',
      userLine: '+77799123',
      type: 'BUY',
      amountUT: 350000,
      valueUSD: 350000 * utPrice,
      pricePerTokenUSD: utPrice,
      priceImpactPercent: +0.035,
      timestamp: Date.now() - 1000 * 60 * 3, // 3 mins ago
    },
    {
      id: 'TRD-8940',
      userLine: '+77724013',
      type: 'BUY',
      amountUT: 800000,
      valueUSD: 800000 * utPrice,
      pricePerTokenUSD: utPrice,
      priceImpactPercent: +0.080,
      timestamp: Date.now() - 1000 * 60 * 11, // 11 mins ago
    },
    {
      id: 'TRD-8939',
      userLine: '+77785432',
      type: 'SELL',
      amountUT: 180000,
      valueUSD: 180000 * utPrice,
      pricePerTokenUSD: utPrice,
      priceImpactPercent: -0.018,
      timestamp: Date.now() - 1000 * 60 * 24, // 24 mins ago
    },
    {
      id: 'TRD-8938',
      userLine: '+77761209',
      type: 'BUY',
      amountUT: 1200000,
      valueUSD: 1200000 * utPrice,
      pricePerTokenUSD: utPrice,
      priceImpactPercent: +0.120,
      timestamp: Date.now() - 1000 * 60 * 48, // 48 mins ago
    },
    {
      id: 'TRD-8937',
      userLine: '+77749001',
      type: 'SELL',
      amountUT: 240000,
      valueUSD: 240000 * utPrice,
      pricePerTokenUSD: utPrice,
      priceImpactPercent: -0.024,
      timestamp: Date.now() - 1000 * 60 * 75, // 1.2 hours ago
    },
    {
      id: 'TRD-8936',
      userLine: '+77713488',
      type: 'BUY',
      amountUT: 650000,
      valueUSD: 650000 * utPrice,
      pricePerTokenUSD: utPrice,
      priceImpactPercent: +0.065,
      timestamp: Date.now() - 1000 * 60 * 110, // 1.8 hours ago
    }
  ], [utPrice]);

  // Aggregate user transactions into market trade statistics
  const userBuyCount = userTransactions.filter(tx => tx.type === 'DEPOSIT' || (tx.type === 'SWAP' && tx.toCurrency === 'UT')).length;
  const userSellCount = userTransactions.filter(tx => tx.type === 'TRANSFER' || (tx.type === 'SWAP' && tx.currency === 'UT')).length;

  const totalBuyTradesCount = 1548 + userBuyCount;
  const totalSellTradesCount = 632 + userSellCount;
  const totalAllTradesCount = totalBuyTradesCount + totalSellTradesCount;

  const buyVolumeUT = 184500000 + userTransactions.filter(tx => tx.type === 'DEPOSIT' && tx.currency === 'UT').reduce((acc, t) => acc + t.amount, 0);
  const sellVolumeUT = 64200000 + userTransactions.filter(tx => tx.type === 'TRANSFER' && tx.currency === 'UT').reduce((acc, t) => acc + t.amount, 0);
  const totalVolumeUSD = (buyVolumeUT + sellVolumeUT) * utPrice;

  const buyRatioPercent = Number(((totalBuyTradesCount / totalAllTradesCount) * 100).toFixed(1));
  const sellRatioPercent = Number((100 - buyRatioPercent).toFixed(1));

  // Dynamic price impact calculation for simulator
  const simImpactDeltaUSD = (simAmountUT * utPrice) / circulatingUT;
  const simNewPrice = simTradeType === 'BUY' ? utPrice + simImpactDeltaUSD : Math.max(UT_BASE_FLOOR_PRICE, utPrice - simImpactDeltaUSD);
  const simPriceChangePercent = ((simNewPrice - utPrice) / utPrice) * 100;

  const chartData = reserveBreakdown.map(item => ({
    name: ASSET_META[item.id]?.fullName || item.id,
    shortName: ASSET_META[item.id]?.pairSymbol || item.id,
    id: item.id,
    value: Math.round(item.valueUSD),
    amount: item.amount,
    unit: ASSET_META[item.id]?.unit || '',
    percentage: Number(item.percentage.toFixed(1)),
    impactPerTokenUSD: item.impactPerTokenUSD,
    color: ASSET_META[item.id]?.color || '#3b82f6'
  }));

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* 1. MAIN VAULT OVERVIEW CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-b-4 border-slate-200 relative overflow-hidden">
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
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Backed Collateral 100%
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.treasurySubtitle}</p>
            </div>
          </div>

          {/* UT Valuation Live Metric Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-sky-50/80 border border-emerald-200/80 rounded-2xl p-4 text-end min-w-[240px] shadow-xs">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-end gap-1">
              <Scale className="w-3.5 h-3.5" /> نرخ لحظه‌ای ۱۰۰٪ با پشتوانه
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-0.5 font-mono" dir="ltr">
              1 UT = ${formatTokenPrice(utPrice, lang)} USD
            </div>
            <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500 font-medium mt-1">
              <span>قیمت پایه:</span>
              <span className="font-mono font-bold text-slate-700" dir="ltr">${formatTokenPrice(baseFloorPrice || UT_BASE_FLOOR_PRICE, lang)}</span>
            </div>
          </div>
        </div>

        {/* Vault Stats Summary Bar (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.backingValue}</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">طلا و ارزهای ذخیره</span>
            </div>
            <span className="text-2xl font-black text-slate-900 font-mono block" dir="ltr">
              ${formatNumber(totalReserveValueUSD, lang, { maximumFractionDigits: 0 })} USD
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">مجموع ارزش دلاری وثایق قفل شده در خزانه</span>
          </div>

          <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.utReserve}</span>
              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">عرضه کل و قابل معامله</span>
            </div>
            <span className="text-2xl font-black text-sky-700 font-mono block" dir="ltr">
              {formatNumber(circulatingUT, lang, { maximumFractionDigits: 0 })} UT
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">یک میلیارد توکن صادر شده تحت ضمانت خزانه</span>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ضریب تقویت ارزش توکن</span>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">Backing Multiplier</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-2xl font-black text-teal-950 font-mono" dir="ltr">
                +{formatNumber(Math.round(backingMultiplier), lang)}x
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">افزایش ارزش نسبت به قیمت پایه ($0.0000001)</span>
          </div>
        </div>

        {/* Transparency Guarantee Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-sky-700 text-white rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3 shadow-md border-b-2 border-emerald-900">
          <Info className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-sky-200 block mb-1">شفافیت ۱۰۰٪ و ارزش‌گذاری الگوریتمی وثیقه‌محور:</span>
            <p className="text-emerald-50">
              قیمت پایه <b>$0.0000001 USD</b> بر روی کل عرضه ۱ میلیارد توکن UT تعریف شده و ارزش واقعی لحظه‌ای آن مستقیماً با واریز و افزایش ارزش ذخایر طلا، نقره، پالادیوم، بیت‌کوین و اتریوم رشد می‌کند. نرخ فعلی هر توکن معادل <b>${formatTokenPrice(utPrice, lang)} USD</b> است.
            </p>
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
                  formatter={(val: number) => [`$${val.toLocaleString()} USD`, 'ارزش وثیقه']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400">کل ذخایر خزانه</span>
              <span className="text-base font-black text-slate-800">
                ${(totalReserveValueUSD / 1000000).toFixed(2)}M USD
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="lg:col-span-7 space-y-2.5">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>{t.backedBy} (تفکیک سبد دارایی‌ها و تاثیر بر هر توکن)</span>
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
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 block">
                        {item.shortName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                        {formatNumber(item.amount, lang)} {item.unit}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold font-mono block mt-0.5" dir="ltr">
                        +{formatTokenPrice(item.impactPerTokenUSD, lang)}/UT
                      </span>
                    </div>
                  </div>

                  <div className="text-end">
                    <span className="font-extrabold text-xs text-slate-700 block font-mono" dir="ltr">
                      ${formatNumber(item.value, lang)}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 inline-block mt-0.5">
                      {item.percentage}% از خزانه
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED SECTION: USER BUY & SELL STATS & DIRECT PRICE IMPACT DYNAMICS */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-b-4 border-slate-200 space-y-6">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2 flex-wrap">
                <span>آمار خرید و فروش‌های کاربران و تاثیر بر قیمت UT</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  تاثیر الگوریتمی مستقیم
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعداد و حجم معاملات خرید و فروش کاربران که به صورت آنی وثایق خزانه را افزایش یا کاهش داده و روند قیمت را تعیین می‌کند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 font-mono" dir="ltr">۲۴ ساعته: {totalAllTradesCount.toLocaleString()} معامله</span>
          </div>
        </div>

        {/* 4 Metric Cards for Buys, Sells, Volume & Sentiment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Buy Orders Count & Inflow */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                تعداد خریدهای کاربران
              </span>
              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                BUY (+ورودی)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono" dir="ltr">
                {totalBuyTradesCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700">سفارش موفق</span>
            </div>
            <div className="text-[11px] text-emerald-700/90 font-medium pt-1 border-t border-emerald-200/60 flex items-center justify-between">
              <span>حجم ورودی وثایق:</span>
              <span className="font-mono font-black" dir="ltr">+${formatNumber((buyVolumeUT * utPrice), lang, { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-[10px] text-emerald-800/80">
              * هر خرید باعث واریز دارایی به خزانه و افزایش مستقیم قیمت هر توکن می‌شود.
            </p>
          </div>

          {/* Card 2: Sell Orders Count & Outflow */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                تعداد فروش‌های کاربران
              </span>
              <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                SELL (تسویه)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-950 font-mono" dir="ltr">
                {totalSellTradesCount.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-700">سفارش تسویه</span>
            </div>
            <div className="text-[11px] text-rose-700/90 font-medium pt-1 border-t border-rose-200/60 flex items-center justify-between">
              <span>حجم خروجی تسویه:</span>
              <span className="font-mono font-black" dir="ltr">-${formatNumber((sellVolumeUT * utPrice), lang, { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="text-[10px] text-rose-800/80">
              * فروش‌ها توکن‌های معادل را از گردش کسر یا وثیقه بازخرید را پرداخت می‌کنند.
            </p>
          </div>

          {/* Card 3: Buy/Sell Pressure Ratio */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 p-4 sm:p-5 rounded-2xl border border-sky-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-sky-600" />
                فشار و برتری بازار
              </span>
              <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                Bullish Inflow
              </span>
            </div>
            
            {/* Visual Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black font-mono">
                <span className="text-emerald-700">{buyRatioPercent}% خرید</span>
                <span className="text-rose-700">{sellRatioPercent}% فروش</span>
              </div>
              <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-s-full"
                  style={{ width: `${buyRatioPercent}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-sky-800 font-bold flex items-center gap-1 pt-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>تقاضای خرید بالاتر از فروش (+{Number((buyRatioPercent - sellRatioPercent).toFixed(1))}%)</span>
            </div>
          </div>

          {/* Card 4: Total 24h Trading Volume & Collateral Net Inflow */}
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 p-4 sm:p-5 rounded-2xl text-white shadow-md space-y-2 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                حجم کل معاملات ۲۴h
              </span>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                Live Net
              </span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 block" dir="ltr">
                ${formatNumber(totalVolumeUSD, lang, { maximumFractionDigits: 0 })} USD
              </span>
              <span className="text-[11px] font-mono text-slate-300 block mt-0.5" dir="ltr">
                {formatNumber(buyVolumeUT + sellVolumeUT, lang, { maximumFractionDigits: 0 })} UT
              </span>
            </div>
            <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-800 flex items-center justify-between">
              <span>خالص ورودی به خزانه:</span>
              <span className="text-emerald-300 font-bold font-mono" dir="ltr">+${formatNumber((buyVolumeUT - sellVolumeUT) * utPrice, lang, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

        </div>

        {/* 3. INTERACTIVE SIMULATOR & PRICING MECHANISM EXPLANATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/80 p-4 sm:p-6 rounded-3xl border border-slate-200/90">
          
          {/* Left / Top: Mathematical Explanation */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>فرمول تاثیر خرید و فروش کاربران بر قیمت UT</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              ارزش هر توکن UT به صورت لحظه‌ای با فرمول ریاضی زیر تعیین می‌شود. زمانی که کاربران اقدام به <b>خرید UT</b> (یا واریز طلا و رمزارز) می‌کنند، وثایق جدید مستقیماً به استخر خزانه تزریق شده و <b>قیمت کف و لحظه‌ای توکن رشد می‌کند</b>:
            </p>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 space-y-1.5 shadow-xs" dir="ltr">
              <div className="text-center font-black text-emerald-700 bg-emerald-50/80 py-1.5 rounded-xl border border-emerald-100 text-[11px] sm:text-xs">
                UT Price = (Initial Vault Collateral + User Buy Inflows - Sell Outflows) / Circulating Supply
              </div>
              <div className="text-[10px] text-slate-500 text-center">
                Δ Price Impact = (Trade Volume USD) / 1,000,000,000 UT
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/70 text-emerald-900">
                <span className="font-bold block mb-0.5">اثر خرید (+BUY):</span>
                <span>افزایش نقدینگی و رشد مستقیم ارزش هر توکن</span>
              </div>
              <div className="bg-rose-50/80 p-2.5 rounded-xl border border-rose-200/70 text-rose-900">
                <span className="font-bold block mb-0.5">اثر فروش (-SELL):</span>
                <span>تسویه و کسر ارزش از استخر شناور</span>
              </div>
            </div>
          </div>

          {/* Right / Bottom: Interactive Live Simulator */}
          <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-black text-xs sm:text-sm">
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>شبیه‌ساز آنی تاثیر حجم خرید/فروش بر قیمت</span>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSimTradeType('BUY')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    simTradeType === 'BUY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  خرید (Buy)
                </button>
                <button
                  type="button"
                  onClick={() => setSimTradeType('SELL')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    simTradeType === 'SELL' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  فروش (Sell)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                مقدار توکن مورد معامله کاربران (UT):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="10000"
                  min="1000"
                  max="100000000"
                  value={simAmountUT}
                  onChange={(e) => setSimAmountUT(Math.max(1000, Number(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">UT</span>
              </div>
            </div>

            {/* Simulation Results Display */}
            <div className={`p-3 rounded-2xl border transition-all ${
              simTradeType === 'BUY' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-bold">معادل دلاری معامله:</span>
                <span className="font-mono font-black text-slate-800" dir="ltr">
                  ${formatNumber(simAmountUT * utPrice, lang, { maximumFractionDigits: 2 })} USD
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-bold">تغییر پیش‌بینی شده در قیمت هر UT:</span>
                <span className={`font-mono font-black ${simTradeType === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`} dir="ltr">
                  {simTradeType === 'BUY' ? '+' : '-'}${formatTokenPrice(simImpactDeltaUSD, lang)} ({simTradeType === 'BUY' ? '+' : ''}{simPriceChangePercent.toFixed(3)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/80 font-bold">
                <span className="text-slate-700">قیمت تخمینی جدید پس از معامله:</span>
                <span className="font-mono font-black text-emerald-950 text-sm" dir="ltr">
                  ${formatTokenPrice(simNewPrice, lang)} USD
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. RECENT REAL-TIME USER TRADES FEED (آخرین خرید و فروش‌های شبکه و کاربران) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>آخرین تراکنش‌ها و سفارشات خرید و فروش ثبت شده در شبکه</span>
            </h4>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {baseSimulatedTrades.map((trade) => {
              const isBuy = trade.type === 'BUY';
              return (
                <div
                  key={trade.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isBuy ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isBuy ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isBuy ? 'خرید' : 'فروش'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-700 truncate" dir="ltr">
                          {trade.userLine}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5" dir="ltr">
                        {trade.id}
                      </span>
                    </div>
                  </div>

                  <div className="text-end shrink-0">
                    <span className={`font-mono font-black text-xs block ${isBuy ? 'text-emerald-700' : 'text-rose-700'}`} dir="ltr">
                      {isBuy ? '+' : '-'}{formatNumber(trade.amountUT, lang)} UT
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block" dir="ltr">
                      ${formatNumber(trade.valueUSD, lang, { maximumFractionDigits: 0 })} USD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
