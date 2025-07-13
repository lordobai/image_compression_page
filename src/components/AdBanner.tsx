import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat: 'auto' | 'banner' | 'rectangle' | 'responsive';
  className?: string;
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot, 
  adFormat, 
  className = '',
  style = {} 
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if AdSense is loaded
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch (error) {
        console.warn('AdSense error:', error);
      }
    }
  }, [adSlot]);

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

  return (
    <div 
      ref={adRef}
      className={`ad-banner ${className}`}
      style={getAdStyle()}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2361186618122633"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={adFormat === 'responsive' ? 'true' : 'false'}
  />
    </div>
  );
}; 