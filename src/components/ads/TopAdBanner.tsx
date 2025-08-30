import React from 'react';
import { motion } from 'framer-motion';
import { AdBanner } from '../AdBanner';

interface TopAdBannerProps {
  isPremium?: boolean;
  hasConsent?: boolean;
}

export const TopAdBanner: React.FC<TopAdBannerProps> = ({ 
  isPremium = false,
  hasConsent = true 
}) => {
  if (isPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mb-8"
    >
      <AdBanner
        adSlot="4289906206"
        adFormat="responsive"
        className="w-full h-24 glass-light rounded-2xl flex items-center justify-center overflow-hidden relative"
        hasConsent={hasConsent}
      />
    </motion.div>
  );
}; 