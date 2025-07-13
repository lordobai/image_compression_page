// Client-side subscription and usage tracking utilities
export interface UsageData {
  userId: string;
  month: string; // Format: "2024-01"
  imagesCompressed: number;
  totalSizeSaved: number;
  lastUpdated: Date;
}

export interface LimitCheck {
  canProceed: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  message: string | null;
}

export interface CompressionHistoryItem {
  id: string;
  originalFilename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
  timestamp: Date;
  compressedFileUrl?: string; // Data URL for re-download
}

// Get current month in YYYY-MM format
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get user's subscription tier from localStorage
export const getUserTier = (): 'free' | 'pro' | 'enterprise' => {
  if (typeof window === 'undefined') return 'free';
  return (localStorage.getItem('subscription_tier') as any) || 'free';
};

// Set user's subscription tier
export const setUserTier = (tier: 'free' | 'pro' | 'enterprise'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('subscription_tier', tier);
  
  // Set expiration for Pro/Enterprise (30 days from now)
  if (tier !== 'free') {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 30);
    localStorage.setItem('subscription_expires', expiration.toISOString());
  } else {
    localStorage.removeItem('subscription_expires');
  }
};

// Check if subscription is still valid
export const isSubscriptionValid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const tier = getUserTier();
  if (tier === 'free') return true;
  
  const expiration = localStorage.getItem('subscription_expires');
  if (!expiration) return false;
  
  return new Date(expiration) > new Date();
};

// Get current usage from localStorage
export const getCurrentUsage = (): UsageData => {
  if (typeof window === 'undefined') {
    return {
      userId: 'guest',
      month: getCurrentMonth(),
      imagesCompressed: 0,
      totalSizeSaved: 0,
      lastUpdated: new Date()
    };
  }

  const month = getCurrentMonth();
  const key = `usage_${month}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    const data = JSON.parse(stored);
    return {
      ...data,
      lastUpdated: new Date(data.lastUpdated)
    };
  }

  return {
    userId: 'guest',
    month,
    imagesCompressed: 0,
    totalSizeSaved: 0,
    lastUpdated: new Date()
  };
};

// Save usage to localStorage
export const saveUsage = (usage: UsageData): void => {
  if (typeof window === 'undefined') return;
  const key = `usage_${usage.month}`;
  localStorage.setItem(key, JSON.stringify(usage));
};

// Check if user can compress more images this month
export const checkMonthlyUsage = async (): Promise<LimitCheck> => {
  const tier = getUserTier();
  const limits = {
    free: 100,
    pro: 1000,
    enterprise: 10000
  };

  const limit = limits[tier] || 100;
  const usage = getCurrentUsage();
  const currentUsage = usage.imagesCompressed;
  const remaining = Math.max(0, limit - currentUsage);
  const canProceed = currentUsage < limit;

  return {
    canProceed,
    currentUsage,
    limit,
    remaining,
    message: canProceed ? null : `Monthly limit reached. Upgrade to Pro for more.`
  };
};

// Increment usage after successful compression
export const incrementUsage = async (imagesCount: number, sizeSaved: number): Promise<void> => {
  const usage = getCurrentUsage();
  const newUsage: UsageData = {
    ...usage,
    imagesCompressed: usage.imagesCompressed + imagesCount,
    totalSizeSaved: usage.totalSizeSaved + sizeSaved,
    lastUpdated: new Date()
  };
  
  saveUsage(newUsage);
};

// Get user's current usage statistics
export const getUserUsage = async (): Promise<UsageData> => {
  return getCurrentUsage();
};

// Compression History (Premium Feature)
export const getCompressionHistory = (): CompressionHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  if (getUserTier() === 'free') return [];
  
  const stored = localStorage.getItem('compression_history');
  if (!stored) return [];
  
  const history = JSON.parse(stored);
  return history.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp)
  }));
};

// Add item to compression history
export const addToCompressionHistory = (item: Omit<CompressionHistoryItem, 'id' | 'timestamp'>): void => {
  if (typeof window === 'undefined') return;
  if (getUserTier() === 'free') return;
  
  const history = getCompressionHistory();
  const newItem: CompressionHistoryItem = {
    ...item,
    id: Date.now().toString(),
    timestamp: new Date()
  };
  
  // Keep only last 100 items
  const updatedHistory = [newItem, ...history].slice(0, 100);
  localStorage.setItem('compression_history', JSON.stringify(updatedHistory));
};

// Clear compression history
export const clearCompressionHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('compression_history');
};

// Reset usage for testing
export const resetUsage = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  const month = getCurrentMonth();
  localStorage.removeItem(`usage_${month}`);
};

// Get all usage data for analytics
export const getAllUsageData = (): UsageData[] => {
  if (typeof window === 'undefined') return [];
  
  const usageData: UsageData[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('usage_')) {
      try {
        const item = localStorage.getItem(key);
        if (!item) continue;
        const data = JSON.parse(item);
        usageData.push({
          ...data,
          lastUpdated: new Date(data.lastUpdated)
        });
      } catch (error) {
        console.error('Error parsing usage data:', error);
      }
    }
  }
  
  return usageData.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
};

// Export settings (Premium Feature)
export const exportSettings = (): string => {
  if (typeof window === 'undefined') return '';
  if (getUserTier() === 'free') return '';
  
  const data = {
    subscription: {
      tier: getUserTier(),
      valid: isSubscriptionValid()
    },
    usage: getAllUsageData(),
    history: getCompressionHistory(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};

// Import settings (Premium Feature)
export const importSettings = (jsonData: string): boolean => {
  if (typeof window === 'undefined') return false;
  if (getUserTier() === 'free') return false;
  
  try {
    const data = JSON.parse(jsonData);
    
    if (data.subscription) {
      setUserTier(data.subscription.tier);
    }
    
    if (data.usage) {
      data.usage.forEach((usage: UsageData) => {
        const key = `usage_${usage.month}`;
        localStorage.setItem(key, JSON.stringify(usage));
      });
    }
    
    if (data.history) {
      localStorage.setItem('compression_history', JSON.stringify(data.history));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing settings:', error);
    return false;
  }
}; 