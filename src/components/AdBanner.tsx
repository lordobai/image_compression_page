import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AdBannerProps {
  adUnitId: string;
  className?: string;
  isPremium?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adUnitId,
  className = '',
  isPremium = false,
}) => {
  const adRef = useRef<any>(null);
  const initialized = useRef(false); // Prevent double initialization

  useEffect(() => {
    if (isPremium) return; // Don't show ads for premium users

    // Only initialize AdSense if not already done and container has width
    if (
      adRef.current &&
      !initialized.current &&
      adRef.current.offsetWidth > 0 &&
      typeof window !== 'undefined' &&
      (window as any).adsbygoogle
    ) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        initialized.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [isPremium]);

  if (isPremium) {
    return null; // Don't render ad container for premium users
  }

  return (
    <motion.div 
      className={`ad-banner ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </motion.div>
  );
};

// Responsive ad banner for different positions
export const TopAdBanner: React.FC<{ isPremium?: boolean }> = ({ isPremium }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
  <AdBanner
    adUnitId="YOUR_TOP_AD_UNIT_ID"
      className="w-full h-24 glass-light rounded-2xl flex items-center justify-center mb-8 overflow-hidden relative"
    isPremium={isPremium}
  />
  </motion.div>
);

export const SidebarAdBanner: React.FC<{ isPremium?: boolean }> = ({ isPremium }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
  >
  <AdBanner
    adUnitId="YOUR_SIDEBAR_AD_UNIT_ID"
      className="w-full h-96 glass-light rounded-2xl flex items-center justify-center overflow-hidden relative"
    isPremium={isPremium}
  />
  </motion.div>
);

export const BottomAdBanner: React.FC<{ isPremium?: boolean }> = ({ isPremium }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
  <AdBanner
    adUnitId="YOUR_BOTTOM_AD_UNIT_ID"
      className="w-full h-24 glass-light rounded-2xl flex items-center justify-center mt-8 overflow-hidden relative"
    isPremium={isPremium}
  />
  </motion.div>
); 