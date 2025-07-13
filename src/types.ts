export interface CompressedImage {
  id: string;
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality: number;
  format: string;
  previewUrl: string;
  compressedPreviewUrl: string;
}

// Image compression types
export interface CompressionOptions {
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  progressive?: boolean;
  optimize?: boolean;
}

export interface CompressionResult {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    original: { width: number; height: number };
    compressed: { width: number; height: number };
  };
}

// App settings types
export interface AppSettings {
  // Default Settings
  defaultCompressionMode: 'preset' | 'smart' | 'custom';
  defaultQualityPreset: 'highQuality' | 'balanced' | 'highCompression' | 'maximumCompression';
  
  // UI Preferences
  showFileSizes: boolean;
  autoDownload: boolean;
  
  // Performance
  maxFileSizeMB: number;
  maxBatchSize: number;
  
  // Custom Mode Defaults
  defaultCustomFormat: 'jpeg' | 'webp' | 'png';
  defaultCustomQuality: 'ultraHigh' | 'high' | 'medium' | 'low' | 'minimum';
  defaultCustomMaxWidth?: number;
  defaultCustomMaxHeight?: number;
}

export type SettingsKey = keyof AppSettings;

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  usageStats: {
    imagesCompressed: number;
    totalSizeSaved: number;
    monthlyUsage: number;
  };
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    maxFileSize: number;
    maxFilesPerBatch: number;
    maxImagesPerMonth: number;
  };
}

export interface AdConfig {
  enabled: boolean;
  adUnitId: string;
  position: 'top' | 'bottom' | 'sidebar';
}

// Premium features and subscription management
export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface UsageLimits {
  free: {
    maxFileSizeMB: number;
    maxBatchSize: number;
    maxImagesPerMonth: number;
    features: string[];
  };
  pro: {
    maxFileSizeMB: number;
    maxBatchSize: number;
    maxImagesPerMonth: number;
    features: string[];
  };
  enterprise: {
    maxFileSizeMB: number;
    maxBatchSize: number;
    maxImagesPerMonth: number;
    features: string[];
  };
}

export interface PremiumFeatures {
  watermarking: boolean;
  bulkDownload: boolean;
  compressionHistory: boolean;
  advancedFormats: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  customBranding: boolean;
} 