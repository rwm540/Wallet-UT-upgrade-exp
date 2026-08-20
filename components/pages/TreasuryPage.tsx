import React from 'react';
import { Treasury } from '../Treasury';
import { Translation, LanguageCode } from '../../translations';
import { LiveMarketPrices } from '../../services/priceService';
import { motion } from 'motion/react';

interface TreasuryPageProps {
  t: Translation;
  lang: LanguageCode;
  prices: LiveMarketPrices;
  reserves: Record<string, number>;
  circulatingUT: number;
}

export const TreasuryPage: React.FC<TreasuryPageProps> = ({
  t,
  lang,
  prices,
  reserves,
  circulatingUT,
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
      />
    </motion.div>
  );
};
