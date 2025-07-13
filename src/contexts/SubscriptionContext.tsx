import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { SubscriptionStatus, UsageLimits, PremiumFeatures } from '../types';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  usageLimits: UsageLimits;
  premiumFeatures: PremiumFeatures;
  isFeatureAvailable: (feature: keyof PremiumFeatures) => boolean;
  checkUsageLimit: (type: 'fileSize' | 'batchSize' | 'monthlyUsage', value: number) => boolean;
  upgradeToPro: () => void;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Define usage limits for each tier
const USAGE_LIMITS: UsageLimits = {
  free: {
    maxFileSizeMB: 10,
    maxBatchSize: 10,
    maxImagesPerMonth: 100,
    features: ['Basic compression', 'JPEG/PNG/WebP formats', 'Drag & drop']
  },
  pro: {
    maxFileSizeMB: 50,
    maxBatchSize: 50,
    maxImagesPerMonth: 1000,
    features: ['Advanced compression', 'All formats', 'Bulk download', 'Compression history', 'No ads']
  },
  enterprise: {
    maxFileSizeMB: 100,
    maxBatchSize: 100,
    maxImagesPerMonth: 10000,
    features: ['All Pro features', 'API access', 'Custom branding', 'Priority support', 'Team collaboration']
  }
};

// Define premium features for each tier
const getPremiumFeatures = (tier: 'free' | 'pro' | 'enterprise'): PremiumFeatures => {
  const baseFeatures = {
    watermarking: false,
    bulkDownload: false,
    compressionHistory: false,
    advancedFormats: false,
    prioritySupport: false,
    apiAccess: false,
    customBranding: false
  };

  switch (tier) {
    case 'pro':
      return {
        ...baseFeatures,
        bulkDownload: true,
        compressionHistory: true,
        advancedFormats: true,
        prioritySupport: true
      };
    case 'enterprise':
      return {
        ...baseFeatures,
        watermarking: true,
        bulkDownload: true,
        compressionHistory: true,
        advancedFormats: true,
        prioritySupport: true,
        apiAccess: true,
        customBranding: true
      };
    default:
      return baseFeatures;
  }
};

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    tier: 'free'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Get usage limits and premium features based on subscription tier
  const currentUsageLimits = USAGE_LIMITS[subscriptionStatus.tier];
  const premiumFeatures = getPremiumFeatures(subscriptionStatus.tier);

  // Check if a specific feature is available
  const isFeatureAvailable = (feature: keyof PremiumFeatures): boolean => {
    return premiumFeatures[feature];
  };

  // Check if usage is within limits
  const checkUsageLimit = (type: 'fileSize' | 'batchSize' | 'monthlyUsage', value: number): boolean => {
    switch (type) {
      case 'fileSize':
        return value <= currentUsageLimits.maxFileSizeMB * 1024 * 1024;
      case 'batchSize':
        return value <= currentUsageLimits.maxBatchSize;
      case 'monthlyUsage':
        return value <= currentUsageLimits.maxImagesPerMonth;
      default:
        return true;
    }
  };

  // Upgrade to Pro (placeholder for Stripe integration)
  const upgradeToPro = () => {
    // This would integrate with Stripe checkout
    console.log('Upgrading to Pro...');
    // For now, just update the subscription status
    setSubscriptionStatus({
      isActive: true,
      tier: 'pro',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
  };

  // Load subscription status when user changes
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // In a real app, you'd fetch subscription status from your backend
        // For now, we'll simulate a free user
        setSubscriptionStatus({
          isActive: false,
          tier: 'free'
        });
      } else {
        setSubscriptionStatus({
          isActive: false,
          tier: 'free'
        });
      }
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const value: SubscriptionContextType = {
    subscriptionStatus,
    usageLimits: USAGE_LIMITS,
    premiumFeatures,
    isFeatureAvailable,
    checkUsageLimit,
    upgradeToPro,
    isLoading
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 