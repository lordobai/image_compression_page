import React from 'react';
import { motion } from 'framer-motion';
import { AdBanner } from '../AdBanner';

interface BottomAdBannerProps {
  isPremium?: boolean;
}

export const BottomAdBanner: React.FC<BottomAdBannerProps> = ({ isPremium = false }) => {
  if (isPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mt-8"
    >
      <AdBanner
        adSlot="4382756610"
        adFormat="responsive"
        className="w-full h-24 glass-light rounded-2xl flex items-center justify-center overflow-hidden relative"
      />
    </motion.div>
  );
}; 