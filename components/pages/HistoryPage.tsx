import React from 'react';
import { TransactionHistory } from '../TransactionHistory';
import { Translation, LanguageCode } from '../../translations';
import { Transaction } from '../../types';
import { motion } from 'motion/react';

interface HistoryPageProps {
  transactions: Transaction[];
  t: Translation;
  lang: LanguageCode;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  transactions,
  t,
  lang,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <TransactionHistory 
        transactions={transactions} 
        t={t} 
        lang={lang} 
      />
    </motion.div>
  );
};
