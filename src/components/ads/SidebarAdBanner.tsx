import React from 'react';
import { motion } from 'framer-motion';
import { AdBanner } from '../AdBanner';

interface SidebarAdBannerProps {
  isPremium?: boolean;
  hasConsent?: boolean;
}

export const SidebarAdBanner: React.FC<SidebarAdBannerProps> = ({ 
  isPremium = false,
  hasConsent = true 
}) => {
  if (isPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden lg:block w-80"
    >
      <AdBanner
        adSlot="4229362301"
        adFormat="responsive"
        className="w-full h-[600px] glass-light rounded-2xl flex items-center justify-center overflow-hidden relative sticky top-4"
        hasConsent={hasConsent}
      />
    </motion.div>
  );
}; 