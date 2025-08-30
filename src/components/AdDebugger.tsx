import React, { useState, useEffect } from 'react';

interface AdDebuggerProps {
  adSlot: string;
  adFormat: string;
}

export const AdDebugger: React.FC<AdDebuggerProps> = ({ adSlot, adFormat }) => {
  const [debugInfo, setDebugInfo] = useState({
    adsbygoogleLoaded: false,
    consent: null as string | null,
    adBlocked: false,
    networkStatus: 'unknown' as string,
    errors: [] as string[]
  });

  useEffect(() => {
    const checkAdSense = () => {
      const info = {
        adsbygoogleLoaded: false,
        consent: null as string | null,
        adBlocked: false,
        networkStatus: 'unknown' as string,
        errors: [] as string[]
      };

      // Check if AdSense is loaded
      if (typeof window !== 'undefined') {
        info.adsbygoogleLoaded = !!(window as any).adsbygoogle;
        
        // Check consent
        info.consent = localStorage.getItem('adConsent');
        
        // Check for ad blockers (basic detection)
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-10000px';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
          const isBlocked = testAd.offsetHeight === 0;
          info.adBlocked = isBlocked;
          document.body.removeChild(testAd);
        }, 100);

        // Check network status
        if (navigator.onLine) {
          info.networkStatus = 'online';
        } else {
          info.networkStatus = 'offline';
        }

        // Check for common errors
        if (!info.adsbygoogleLoaded) {
          info.errors.push('AdSense script not loaded');
        }
        if (info.consent === 'denied') {
          info.errors.push('User denied consent');
        }
        if (info.adBlocked) {
          info.errors.push('Ad blocker detected');
        }
        if (info.networkStatus === 'offline') {
          info.errors.push('Network offline');
        }
      }

      setDebugInfo(info);
    };

    checkAdSense();
    const interval = setInterval(checkAdSense, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [adSlot, adFormat]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debugger in production
  }

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h4 className="font-bold mb-2">Ad Debug Info</h4>
      <div className="space-y-1">
        <div>Slot: {adSlot}</div>
        <div>Format: {adFormat}</div>
        <div>AdSense: {debugInfo.adsbygoogleLoaded ? '✅' : '❌'}</div>
        <div>Consent: {debugInfo.consent || 'not set'}</div>
        <div>Ad Blocker: {debugInfo.adBlocked ? '❌' : '✅'}</div>
        <div>Network: {debugInfo.networkStatus}</div>
        {debugInfo.errors.length > 0 && (
          <div className="mt-2">
            <div className="font-bold text-red-400">Errors:</div>
            {debugInfo.errors.map((error, index) => (
              <div key={index} className="text-red-300">• {error}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
