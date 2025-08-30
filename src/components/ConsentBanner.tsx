import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsentBannerProps {
  onConsentChange: (consent: boolean) => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('adConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setShowBanner(false);
    onConsentChange(true);
    // Call the global consent function
    if (typeof window !== 'undefined' && (window as any).setConsent) {
      (window as any).setConsent(true);
    }
  };

  const handleDecline = () => {
    setShowBanner(false);
    onConsentChange(false);
    // Call the global consent function
    if (typeof window !== 'undefined' && (window as any).setConsent) {
      (window as any).setConsent(false);
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm">
              We use cookies and similar technologies to provide personalized content and advertisements. 
              By clicking "Accept", you consent to our use of cookies for advertising purposes. 
              <a href="/privacy-policy.html" className="underline ml-1 hover:text-blue-300">
                Learn more
              </a>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
