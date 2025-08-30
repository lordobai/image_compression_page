import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat: 'auto' | 'banner' | 'rectangle' | 'responsive';
  className?: string;
  style?: React.CSSProperties;
  hasConsent?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot, 
  adFormat, 
  className = '',
  style = {},
  hasConsent = true
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadAd = useCallback(() => {
    if (!adRef.current) return;

    try {
      console.log(`[AdBanner] Loading ad for slot: ${adSlot}, format: ${adFormat}`);
      
      // Clear any existing ads
      adRef.current.innerHTML = '';
      
      // Create new ad element
      const adElement = document.createElement('ins');
      adElement.className = 'adsbygoogle';
      adElement.style.display = 'block';
      adElement.setAttribute('data-ad-client', 'ca-pub-2361186618122633');
      adElement.setAttribute('data-ad-slot', adSlot);
      adElement.setAttribute('data-ad-format', adFormat);
      if (adFormat === 'responsive') {
        adElement.setAttribute('data-full-width-responsive', 'true');
      }

      adRef.current.appendChild(adElement);

      // Push the ad
      (window as any).adsbygoogle.push({});
      console.log(`[AdBanner] Ad pushed for slot: ${adSlot}`);

      // Set up observer to detect when ad loads
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const adElement = adRef.current?.querySelector('.adsbygoogle');
            if (adElement && adElement.innerHTML.trim() !== '') {
              console.log(`[AdBanner] Ad loaded successfully for slot: ${adSlot}`);
              setAdLoaded(true);
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(adRef.current, { childList: true, subtree: true });

      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        if (!adLoaded) {
          console.warn(`[AdBanner] Ad failed to load for slot: ${adSlot}`);
          setAdError(true);
        }
      }, 5000);

    } catch (error) {
      console.error(`[AdBanner] Error loading ad for slot ${adSlot}:`, error);
      setAdError(true);
    }
  }, [adSlot, adFormat, adLoaded]);

  useEffect(() => {
    // Don't load ads if no consent
    if (!hasConsent) {
      console.log(`[AdBanner] Skipping ad load for slot ${adSlot} - no consent`);
      return;
    }

    // Check if AdSense is loaded
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      loadAd();
    } else {
      // Wait for AdSense to load
      const checkAdSense = setInterval(() => {
        if ((window as any).adsbygoogle) {
          clearInterval(checkAdSense);
          loadAd();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkAdSense);
        console.warn(`[AdBanner] AdSense failed to load for slot ${adSlot}`);
        setAdError(true);
      }, 10000);
    }
  }, [adSlot, hasConsent, loadAd]);

  const retryAd = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setAdError(false);
      setAdLoaded(false);
      setTimeout(loadAd, 1000);
    }
  };

  const getAdStyle = () => {
    const baseStyle = {
      display: 'block',
      textAlign: 'center' as const,
      overflow: 'hidden',
      ...style
    };

    switch (adFormat) {
      case 'banner':
        return {
          ...baseStyle,
          minHeight: '90px',
          width: '100%',
          maxWidth: '728px',
          margin: '0 auto'
        };
      case 'rectangle':
        return {
          ...baseStyle,
          minHeight: '250px',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto'
        };
      case 'responsive':
        return {
          ...baseStyle,
          minHeight: '90px',
          width: '100%'
        };
      default:
        return baseStyle;
    }
  };

  // Don't render if no consent
  if (!hasConsent) {
    return null;
  }

  return (
    <div 
      ref={adRef}
      className={`ad-banner ${className}`}
      style={getAdStyle()}
    >
      {adError && retryCount < 3 && (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={retryAd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Ad ({3 - retryCount} attempts left)
          </button>
        </div>
      )}
      
      {adError && retryCount >= 3 && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <span>Ad temporarily unavailable</span>
        </div>
      )}
      
      {!adLoaded && !adError && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}; 