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

export interface CompressionOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio: boolean;
}

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