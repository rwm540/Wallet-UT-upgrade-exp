import React from 'react';
import { Treasury } from '../Treasury';
import { Translation, LanguageCode } from '../../translations';
import { LiveMarketPrices } from '../../services/priceService';
import { Transaction } from '../../types';
import { motion } from 'motion/react';

interface TreasuryPageProps {
  t: Translation;
  lang: LanguageCode;
  prices: LiveMarketPrices;
  reserves: Record<string, number>;
  circulatingUT: number;
  userTransactions?: Transaction[];
}

export const TreasuryPage: React.FC<TreasuryPageProps> = ({
  t,
  lang,
  prices,
  reserves,
  circulatingUT,
  userTransactions = [],
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="space-y-6"
    >
      <Treasury 
        t={t} 
        lang={lang} 
        prices={prices as unknown as Record<string, number>}
        reserves={reserves}
        circulatingUT={circulatingUT}
        userTransactions={userTransactions}
      />
    </motion.div>
  );
};
