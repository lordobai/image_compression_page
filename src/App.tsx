import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Camera, Download, Zap, Sparkles, Upload, FileImage, BarChart3, Check, Settings, Sliders, Trash2, Crown } from 'lucide-react';
import { 
  compressImages, 
  smartCompress, 
  formatFileSize, 
  downloadFile, 
  compressionPresets,
  type CompressionResult
} from './utils/compression';
import { useSettings } from './contexts/SettingsContext';
import { AppSettings } from './types';
import { useUser } from '@clerk/clerk-react';
import { UserProfile } from './components/UserProfile';
import { TopAdBanner, SidebarAdBanner, BottomAdBanner } from './components/ads';
import { useSubscription } from './contexts/SubscriptionContext';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { CompressionHistoryModal } from './components/CompressionHistoryModal';
import { ImageTooltip } from './components/ImageTooltip';
import { 
  checkMonthlyUsage, 
  incrementUsage, 
  addToCompressionHistory, 
  getCompressionHistory,
  clearCompressionHistory,
  CompressionHistoryItem 
} from './utils/subscription';
import JSZip from 'jszip';


const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressionResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionMode, setCompressionMode] = useState<'preset' | 'smart' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof compressionPresets>('balanced');
  const [customFormat, setCustomFormat] = useState<'jpeg' | 'webp' | 'png'>('jpeg');
  const [customQualityPreset, setCustomQualityPreset] = useState<'ultraHigh' | 'high' | 'medium' | 'low' | 'minimum'>('high');
  const [customMaxWidth, setCustomMaxWidth] = useState<number | undefined>(1600);
  const [customMaxHeight, setCustomMaxHeight] = useState<number | undefined>(900);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalTrigger, setPremiumModalTrigger] = useState<'limit-reached' | 'feature-locked' | 'manual'>('manual');
  const [currentUsage, setCurrentUsage] = useState<{ current: number; limit: number; remaining: number } | null>(null);
  const [compressionHistory, setCompressionHistory] = useState<CompressionHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Add useState for preview URLs
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Settings
  const { settings, updateSetting } = useSettings();
  
  // Auth
  const { isLoaded, user } = useUser();
  
  // Subscription
  const { subscriptionStatus, usageLimits, isFeatureAvailable } = useSubscription();

  // Apply default settings on mount
  useEffect(() => {
    setCompressionMode(settings.defaultCompressionMode);
    setSelectedPreset(settings.defaultQualityPreset);
    setCustomFormat(settings.defaultCustomFormat);
    setCustomQualityPreset(settings.defaultCustomQuality);
    setCustomMaxWidth(settings.defaultCustomMaxWidth);
    setCustomMaxHeight(settings.defaultCustomMaxHeight);
  }, [settings]);

  // Handle browser back button and page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any cached data if needed
      sessionStorage.removeItem('compression-cache');
    };

    const handlePopState = () => {
      // Force a re-render when user navigates back
      window.location.reload();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Load current usage for authenticated users
  useEffect(() => {
    const loadUsage = async () => {
      if (user && subscriptionStatus.tier === 'free') {
        try {
          const usageCheck = await checkMonthlyUsage();
          setCurrentUsage({
            current: usageCheck.currentUsage,
            limit: usageCheck.limit,
            remaining: usageCheck.remaining
          });
        } catch (error) {
          console.error('Error loading usage:', error);
        }
      }
    };

    loadUsage();
  }, [user, subscriptionStatus.tier]);

  // Load compression history for Pro users
  useEffect(() => {
    if (isFeatureAvailable('compressionHistory')) {
      const history = getCompressionHistory();
      setCompressionHistory(history);
    }
  }, [isFeatureAvailable]);

  // Generate preview URLs when files are selected
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      // Clean up object URLs on unmount or when files change
      return () => {
        urls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setPreviewUrls([]);
    }
  }, [selectedFiles]);

  const qualityPresets = [
    { 
      key: 'highQuality' as const, 
      value: 75, // Updated to match compression preset
      label: 'High Quality', 
      description: 'Good compression', 
      icon: Sparkles, 
      color: 'from-emerald-500 to-emerald-600',
      format: 'JPEG'
    },
    { 
      key: 'balanced' as const, 
      value: 65, // Updated to match compression preset
      label: 'Balanced', 
      description: 'Good balance', 
      icon: Check, 
      color: 'from-blue-500 to-blue-600',
      format: 'JPEG'
    },
    { 
      key: 'highCompression' as const, 
      value: 50, // Updated to match compression preset
      label: 'High Compression', 
      description: 'Significant savings', 
      icon: Zap, 
      color: 'from-yellow-500 to-yellow-600',
      format: 'WebP'
    },
    { 
      key: 'maximumCompression' as const, 
      value: 30, // Updated to match compression preset
      label: 'Maximum Compression', 
      description: 'Smallest size', 
      icon: Download, 
      color: 'from-red-500 to-red-600',
      format: 'WebP'
    },
  ];

  const customQualityPresets = [
    { 
      key: 'ultraHigh' as const, 
      value: 95, 
      label: 'Ultra High', 
      description: 'Near original quality', 
      icon: Sparkles, 
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      key: 'high' as const, 
      value: 85, 
      label: 'High', 
      description: 'Excellent quality', 
      icon: Check, 
      color: 'from-blue-500 to-blue-600'
    },
    { 
      key: 'medium' as const, 
      value: 70, 
      label: 'Medium', 
      description: 'Good balance', 
      icon: BarChart3, 
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      key: 'low' as const, 
      value: 50, 
      label: 'Low', 
      description: 'Smaller files', 
      icon: Download, 
      color: 'from-orange-500 to-orange-600'
    },
    { 
      key: 'minimum' as const, 
      value: 30, 
      label: 'Minimum', 
      description: 'Smallest size', 
      icon: Zap, 
      color: 'from-red-500 to-red-600'
    },
  ];

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG', description: 'Best for photos', icon: '📷' },
    { value: 'webp', label: 'WebP', description: 'Modern format', icon: '🌐' },
    { value: 'png', label: 'PNG', description: 'Lossless quality', icon: '🖼️' },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select image files');
      return;
    }

    // Check subscription limits
    const currentLimits = usageLimits[subscriptionStatus.tier];
    
    // Check file size limits
    const maxSizeBytes = currentLimits.maxFileSizeMB * 1024 * 1024;
    const oversizedFiles = imageFiles.filter(file => file.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      if (subscriptionStatus.tier === 'free') {
        setPremiumModalTrigger('limit-reached');
        setShowPremiumModal(true);
        return;
      }
      toast.error(`${oversizedFiles.length} file(s) exceed the ${currentLimits.maxFileSizeMB}MB limit`);
      return;
    }
    
    // Check batch size limits
    if (imageFiles.length > currentLimits.maxBatchSize) {
      if (subscriptionStatus.tier === 'free') {
        setPremiumModalTrigger('limit-reached');
        setShowPremiumModal(true);
        return;
      }
      toast.error(`Maximum ${currentLimits.maxBatchSize} files allowed per batch`);
      return;
    }
    
    setSelectedFiles(imageFiles);
    setCompressedImages([]);
    toast.success(`Selected ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`);
  }, [usageLimits, subscriptionStatus.tier]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please drop image files');
      return;
    }
    
    // Check subscription limits
    const currentLimits = usageLimits[subscriptionStatus.tier];
    
    // Check file size limits
    const maxSizeBytes = currentLimits.maxFileSizeMB * 1024 * 1024;
    const oversizedFiles = imageFiles.filter(file => file.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      if (subscriptionStatus.tier === 'free') {
        setPremiumModalTrigger('limit-reached');
        setShowPremiumModal(true);
        return;
      }
      toast.error(`${oversizedFiles.length} file(s) exceed the ${currentLimits.maxFileSizeMB}MB limit`);
      return;
    }
    
    // Check batch size limits
    if (imageFiles.length > currentLimits.maxBatchSize) {
      if (subscriptionStatus.tier === 'free') {
        setPremiumModalTrigger('limit-reached');
        setShowPremiumModal(true);
        return;
      }
      toast.error(`Maximum ${currentLimits.maxBatchSize} files allowed per batch`);
      return;
    }
    
    setSelectedFiles(imageFiles);
    setCompressedImages([]);
    toast.success(`Dropped ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`);
  }, [usageLimits, subscriptionStatus.tier]);

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    // Check monthly usage limit for free users
    if (subscriptionStatus.tier === 'free' && user) {
      const usageCheck = await checkMonthlyUsage();
      
      if (!usageCheck.canProceed) {
        setPremiumModalTrigger('limit-reached');
        setShowPremiumModal(true);
        return;
      }
      
      // Check if this batch would exceed the limit
      if (usageCheck.remaining < selectedFiles.length) {
        toast.error(`Monthly limit would be exceeded. You can compress ${usageCheck.remaining} more images this month.`);
        setPremiumModalTrigger('limit-reached');
        setShowPremiumModal(true);
        return;
      }
    }

    setIsCompressing(true);
    toast.loading('Compressing images...', { id: 'compression' });

    try {
      let results: CompressionResult[] = [];
      
      if (compressionMode === 'smart') {
        // Use smart compression for each file
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          try {
            const result = await smartCompress(file);
            results.push(result);
          } catch (error) {
            console.error(`Failed to smart compress ${file.name}:`, error);
            toast.error(`Failed to compress ${file.name}`, { id: `error-${i}` });
          }
        }
      } else if (compressionMode === 'custom') {
        // Use custom compression settings
        const selectedQualityPreset = customQualityPresets.find(preset => preset.key === customQualityPreset);
        const customOptions = {
          quality: selectedQualityPreset?.value || 85,
          format: customFormat,
          maxWidth: customMaxWidth,
          maxHeight: customMaxHeight,
          maintainAspectRatio: true,
          progressive: true,
          optimize: true
        };
        results = await compressImages(selectedFiles, customOptions);
      } else {
        // Use preset compression
        const options = compressionPresets[selectedPreset];
        results = await compressImages(selectedFiles, options);
      }
      
      setCompressedImages(results);
      toast.success(`Successfully compressed ${results.length} image${results.length > 1 ? 's' : ''}`, {
        id: 'compression',
      });
      
      // Track usage for authenticated users
      if (user && results.length > 0) {
        const totalSizeSaved = results.reduce((sum, result) => sum + (result.originalSize - result.compressedSize), 0);
        await incrementUsage(results.length, totalSizeSaved);
      }

      // Add to compression history for Pro users
      if (isFeatureAvailable('compressionHistory') && results.length > 0) {
        results.forEach(result => {
          // Convert compressed file to data URL for storage
          const reader = new FileReader();
          reader.onload = () => {
            addToCompressionHistory({
              originalFilename: result.originalFile.name,
              originalSize: result.originalSize,
              compressedSize: result.compressedSize,
              compressionRatio: result.compressionRatio,
              format: result.format,
              quality: compressionMode === 'preset' ? 
                qualityPresets.find(p => p.key === selectedPreset)?.value || 80 :
                compressionMode === 'custom' ? 
                customQualityPresets.find(p => p.key === customQualityPreset)?.value || 85 : 80,
              compressedFileUrl: reader.result as string
            });
          };
          reader.readAsDataURL(result.compressedFile);
        });
        
        // Refresh history display
        setCompressionHistory(getCompressionHistory());
      }
      
      // Auto-download if enabled
      if (settings.autoDownload && results.length > 0) {
        setTimeout(() => {
          handleDownloadAll();
        }, 500);
      }
    } catch (error) {
      toast.error('Failed to compress images', { id: 'compression' });
      console.error('Compression error:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = (image: CompressionResult) => {
    downloadFile(image.compressedFile, image.compressedFile.name);
    toast.success('Download started!');
  };

  const handleDownloadAll = () => {
    // Check if bulk download is available for free users
    if (!isFeatureAvailable('bulkDownload') && subscriptionStatus.tier === 'free') {
      setPremiumModalTrigger('feature-locked');
      setShowPremiumModal(true);
      return;
    }
    
    compressedImages.forEach((image, index) => {
      setTimeout(() => {
        handleDownload(image);
      }, index * 100);
    });
    toast.success('Starting batch download...');
  };

  const handleDownloadAllAsZip = async () => {
    if (!isFeatureAvailable('bulkDownload') && subscriptionStatus.tier === 'free') {
      setPremiumModalTrigger('feature-locked');
      setShowPremiumModal(true);
      return;
    }

    try {
      toast.loading('Creating ZIP file...', { id: 'zip' });
      
      const zip = new JSZip();
      
      compressedImages.forEach((image, index) => {
        zip.file(image.compressedFile.name, image.compressedFile);
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `compressed_images_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(zipUrl);
      
      toast.success('ZIP file downloaded!', { id: 'zip' });
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Failed to create ZIP file', { id: 'zip' });
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    setCompressedImages([]);
    
    // Reset the file input to allow re-uploading the same file
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.success('Files cleared');
  };

  const handleClearHistory = () => {
    clearCompressionHistory();
    setCompressionHistory([]);
    toast.success('Compression history cleared');
  };

  const totalOriginalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial animate-float opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-mesh animate-float opacity-15" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial animate-pulse-slow opacity-10"></div>
      </div>

      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel sticky top-0 z-50 border-b border-white/[0.08]"
      >
        <div className="container-modern">
          <div className="flex items-center justify-between h-12 sm:h-20 py-0.5 sm:py-0">
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-7 h-7 sm:w-12 sm:h-12 gradient-bg-primary rounded-2xl flex items-center justify-center shadow-2xl">
                  <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-gradient-bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <a href="/" className="hover:opacity-80 transition-opacity">
                  <h1 className="text-sm sm:text-lg lg:text-2xl font-bold gradient-text-primary">ShrinkMyPhoto</h1>
                  <p className="text-xs text-neutral-400 font-mono">Free Image Compression</p>
                </a>
              </div>
              
              {/* Welcome Message */}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:flex items-center space-x-1 text-xs sm:text-sm text-neutral-300"
                >
                  <span>Welcome back,</span>
                  <span className="font-medium text-white">
                    {user.firstName || user.username || 'User'}!
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:flex items-center space-x-1 text-xs sm:text-sm text-neutral-400"
                >
                  <span>Guest mode</span>
                  <span className="text-xs">• Settings won't be saved</span>
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              {/* Subscription Status */}
              {subscriptionStatus.tier === 'free' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPremiumModalTrigger('manual');
                    setShowPremiumModal(true);
                  }}
                  className="glass-button p-1.5 sm:p-3 rounded-xl border border-yellow-500/30"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </motion.button>
              )}
              
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="glass-button p-1.5 sm:p-3 rounded-xl"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" />
              </motion.button>
              
              {/* User Profile */}
              <UserProfile />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Top Ad Banner */}
      <TopAdBanner isPremium={subscriptionStatus.tier !== 'free'} />

      {/* Main Content */}
      <main className="container-modern py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <motion.h2 
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-balance leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                Compress Images with{' '}
                  <span className="gradient-text-primary">Elegant Simplicity</span>
                </motion.h2>
                <motion.p 
                  className="text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Experience the future of image compression with our cutting-edge algorithms. Optimize your photos without losing quality, all wrapped in a stunning interface.
                </motion.p>
              </div>
            </motion.div>



            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="glass-panel rounded-2xl p-8 border border-white/[0.08]">
                <div className="space-y-6">
                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-white/[0.2] hover:border-white/[0.3]'
                    }`}
                  >
                    <motion.div
                      animate={{ 
                        scale: isDragOver ? 1.05 : 1,
                        rotate: isDragOver ? 5 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        {isDragOver ? (
                          <Upload className="w-8 h-8 text-white" />
                        ) : (
                          <FileImage className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {isDragOver ? 'Drop your images here' : 'Drag & drop images here'}
                        </h3>
                        <p className="text-neutral-400 mb-4">
                          <span className="hidden sm:inline">or click to browse</span>
                          <span className="sm:hidden">tap to browse</span>
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-input"
                        />
                        <label
                          htmlFor="file-input"
                          className="btn-primary inline-flex items-center space-x-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Files</span>
                        </label>
                      </div>
                      
                      {/* Free Tier Limits */}
                      {subscriptionStatus.tier === 'free' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 p-3 glass-light rounded-lg border border-blue-500/20"
                        >
                          <div className="text-center">
                            <p className="text-xs text-neutral-400 mb-2">Free Tier Limits</p>
                            <div className="flex justify-center items-center space-x-4 text-xs text-neutral-300 mb-2">
                              <span>• {usageLimits.free.maxFileSizeMB}MB max file size</span>
                              <span>• {usageLimits.free.maxBatchSize} files per batch</span>
                              <span>• {usageLimits.free.maxImagesPerMonth} images/month</span>
                            </div>
                            
                            {/* Current Usage Display */}
                            {currentUsage && user && (
                              <div className="mb-2 p-2 bg-white/[0.05] rounded-lg">
                                <div className="text-xs text-neutral-400 mb-1">Monthly Usage</div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-neutral-300">
                                    {currentUsage.current} / {currentUsage.limit} images
                                  </span>
                                  <span className={`text-xs ${
                                    currentUsage.remaining < 10 ? 'text-red-400' : 'text-green-400'
                                  }`}>
                                    {currentUsage.remaining} remaining
                                  </span>
                                </div>
                                <div className="w-full bg-white/[0.1] rounded-full h-1 mt-1">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentUsage.current / currentUsage.limit) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <button
                              onClick={() => {
                                setPremiumModalTrigger('manual');
                                setShowPremiumModal(true);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 mx-auto"
                            >
                              <Crown className="w-3 h-3" />
                              <span>Upgrade to Pro for higher limits</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
            </motion.div>
                  </div>

                  {/* Selected Files */}
                  <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-light rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-white">Selected Files ({selectedFiles.length})</h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleClearFiles}
                            className="btn-secondary text-sm px-3 py-1 flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </motion.button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                          {selectedFiles.map((file, index) => (
                            <ImageTooltip key={index} file={file}>
                              <div className="flex flex-col items-center bg-white/[0.05] rounded-lg p-2 cursor-help">
                                <img
                                  src={previewUrls[index]}
                                  alt={file.name}
                                  className="w-20 h-20 object-contain rounded mb-1 border border-white/[0.1]"
                                  loading="lazy"
                                />
                                <span className="text-xs text-neutral-300 truncate w-20" title={file.name}>{file.name}</span>
                                <span className="text-xs text-neutral-400">{formatFileSize(file.size)}</span>
                              </div>
                            </ImageTooltip>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Compression Mode & Settings */}
                  <AnimatePresence>
                    {selectedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                      >
                        {/* Compression Mode Selector */}
                        <div>
                          <label className="block text-sm font-medium mb-4 text-white">Compression Mode</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Preset Mode */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setCompressionMode('preset')}
                              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                                compressionMode === 'preset'
                                  ? 'glass-medium border-blue-500/50'
                                  : 'glass-light hover:glass-medium border-white/[0.1]'
                              }`}
                            >
                              {compressionMode === 'preset' && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                              
                              <div className="relative flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  compressionMode === 'preset'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                    : 'glass-light'
                                }`}>
                                  <Settings className={`w-5 h-5 ${
                                    compressionMode === 'preset' ? 'text-white' : 'text-neutral-400'
                                  }`} />
                                </div>
                                <div className="text-left">
                                  <div className={`font-medium text-sm ${
                                    compressionMode === 'preset' ? 'text-white' : 'text-neutral-300'
                                  }`}>
                                    Preset Mode
                                  </div>
                                  <div className={`text-xs ${
                                    compressionMode === 'preset' ? 'text-neutral-300' : 'text-neutral-500'
                                  }`}>
                                    Choose quality preset
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                            
                            {/* Smart Mode */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setCompressionMode('smart')}
                              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                                compressionMode === 'smart'
                                  ? 'glass-medium border-blue-500/50'
                                  : 'glass-light hover:glass-medium border-white/[0.1]'
                              }`}
                            >
                              {compressionMode === 'smart' && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                              
                              <div className="relative flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  compressionMode === 'smart'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                    : 'glass-light'
                                }`}>
                                  <Sparkles className={`w-5 h-5 ${
                                    compressionMode === 'smart' ? 'text-white' : 'text-neutral-400'
                                  }`} />
                                </div>
                                <div className="text-left">
                                  <div className={`font-medium text-sm ${
                                    compressionMode === 'smart' ? 'text-white' : 'text-neutral-300'
                                  }`}>
                                    Smart Mode
                                  </div>
                                  <div className={`text-xs ${
                                    compressionMode === 'smart' ? 'text-neutral-300' : 'text-neutral-500'
                                  }`}>
                                    Auto-optimize format
                                  </div>
                                </div>
                              </div>
                            </motion.button>

                            {/* Custom Mode */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setCompressionMode('custom')}
                              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                                compressionMode === 'custom'
                                  ? 'glass-medium border-blue-500/50'
                                  : 'glass-light hover:glass-medium border-white/[0.1]'
                              }`}
                            >
                              {compressionMode === 'custom' && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                              
                              <div className="relative flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  compressionMode === 'custom'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                    : 'glass-light'
                                }`}>
                                  <Sliders className={`w-5 h-5 ${
                                    compressionMode === 'custom' ? 'text-white' : 'text-neutral-400'
                                  }`} />
                                </div>
                                <div className="text-left">
                                  <div className={`font-medium text-sm ${
                                    compressionMode === 'custom' ? 'text-white' : 'text-neutral-300'
                                  }`}>
                                    Custom Mode
                                  </div>
                                  <div className={`text-xs ${
                                    compressionMode === 'custom' ? 'text-neutral-300' : 'text-neutral-500'
                                  }`}>
                                    Full control
                                  </div>
                                </div>
                              </div>
                            </motion.button>
                          </div>
                        </div>

                        {/* Quality Presets (only show in preset mode) */}
                        {compressionMode === 'preset' && (
                          <div>
                            <label className="block text-sm font-medium mb-4 text-white">Quality Preset</label>
                            <div className="grid grid-cols-2 gap-3">
                              {qualityPresets.map((preset) => {
                                const IconComponent = preset.icon;
                                const isSelected = selectedPreset === preset.key;
                                
                                return (
                                  <motion.button
                                    key={preset.key}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedPreset(preset.key)}
                                    className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                                      isSelected
                                        ? 'glass-medium border-blue-500/50'
                                        : 'glass-light hover:glass-medium border-white/[0.1]'
                                    }`}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                      />
                                    )}
                                    
                                    <div className="relative flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        isSelected 
                                          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                          : 'glass-light'
                                      }`}>
                                        <IconComponent className={`w-5 h-5 ${
                                          isSelected ? 'text-white' : 'text-neutral-400'
                                        }`} />
                                      </div>
                                      <div className="text-left">
                                        <div className={`font-medium text-sm ${
                                          isSelected ? 'text-white' : 'text-neutral-300'
                                        }`}>
                                          {preset.label}
                                        </div>
                                        <div className={`text-xs ${
                                          isSelected ? 'text-neutral-300' : 'text-neutral-500'
                                        }`}>
                                          {preset.description} • {preset.format}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Custom Settings (only show in custom mode) */}
                        {compressionMode === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Format Selection */}
                            <div>
                              <label className="block text-sm font-medium mb-4 text-white">Output Format</label>
                              {customFormat === 'png' && (
                                <div className="text-xs text-neutral-400 mb-3 p-2 glass-light rounded-lg">
                                  💡 PNG is lossless - compression only occurs through resizing. For better compression, consider JPEG or WebP.
                                </div>
                              )}
                              <div className="grid grid-cols-3 gap-3">
                                {formatOptions.map((format) => (
                                  <motion.button
                                    key={format.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCustomFormat(format.value as 'jpeg' | 'webp' | 'png')}
                                    className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                                      customFormat === format.value
                                        ? 'glass-medium border-blue-500/50'
                                        : 'glass-light hover:glass-medium border-white/[0.1]'
                                    }`}
                                  >
                                    {customFormat === format.value && (
                                      <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                      />
                                    )}
                                    
                                    <div className="relative text-center">
                                      <div className="text-2xl mb-2">{format.icon}</div>
                                      <div className={`font-medium text-sm ${
                                        customFormat === format.value ? 'text-white' : 'text-neutral-300'
                                      }`}>
                                        {format.label}
                                      </div>
                                      <div className={`text-xs ${
                                        customFormat === format.value ? 'text-neutral-300' : 'text-neutral-500'
                                      }`}>
                                        {format.description}
                                      </div>
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {/* Quality Presets */}
                            <div>
                              <label className="block text-sm font-medium mb-4 text-white">
                                Quality Level
                                {customFormat === 'png' && (
                                  <span className="text-xs text-neutral-400 ml-2">(PNG: affects resizing only)</span>
                                )}
                              </label>
                              <div className="grid grid-cols-5 gap-2">
                                {customQualityPresets.map((preset) => {
                                  const IconComponent = preset.icon;
                                  const isSelected = customQualityPreset === preset.key;
                                  
                                  return (
                                    <motion.button
                                      key={preset.key}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => setCustomQualityPreset(preset.key)}
                                      className={`p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                                        isSelected
                                          ? 'glass-medium border-blue-500/50'
                                          : 'glass-light hover:glass-medium border-white/[0.1]'
                                      }`}
                                    >
                                      {isSelected && (
                                        <motion.div
                                          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.3 }}
                                        />
                                      )}
                                      
                                      <div className="relative text-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                                          isSelected 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                            : 'glass-light'
                                        }`}>
                                          <IconComponent className={`w-4 h-4 ${
                                            isSelected ? 'text-white' : 'text-neutral-400'
                                          }`} />
                                        </div>
                                        <div className={`font-medium text-xs ${
                                          isSelected ? 'text-white' : 'text-neutral-300'
                                        }`}>
                                          {preset.label}
                                        </div>
                                        <div className={`text-xs ${
                                          isSelected ? 'text-neutral-300' : 'text-neutral-500'
                                        }`}>
                                          {preset.value}%
                                        </div>
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Advanced Options Toggle */}
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                className="flex items-center space-x-2 text-sm text-neutral-400 hover:text-white transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                                <span>Advanced Options</span>
                                <motion.div
                                  animate={{ rotate: showAdvancedOptions ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  ▼
                                </motion.div>
                              </button>
                            </div>

                            {/* Advanced Options */}
                            <AnimatePresence>
                              {showAdvancedOptions && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-4 pt-4">
                                    <div className="text-xs text-neutral-400 p-3 glass-light rounded-lg">
                                      💡 Advanced options allow you to resize images for better compression. Leave empty to keep original dimensions.
                                    </div>
                                    
                                    {/* Dimension Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-2 text-white">Max Width (px)</label>
                                        <input
                                          type="number"
                                          value={customMaxWidth || ''}
                                          onChange={(e) => setCustomMaxWidth(e.target.value ? Number(e.target.value) : undefined)}
                                          placeholder="No limit"
                                          className="w-full px-4 py-3 glass-light rounded-xl border border-white/[0.1] text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/50"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-2 text-white">Max Height (px)</label>
                                        <input
                                          type="number"
                                          value={customMaxHeight || ''}
                                          onChange={(e) => setCustomMaxHeight(e.target.value ? Number(e.target.value) : undefined)}
                                          placeholder="No limit"
                                          className="w-full px-4 py-3 glass-light rounded-xl border border-white/[0.1] text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/50"
                                        />
                                      </div>
                                    </div>
                                  </div>
              </motion.div>
            )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Compress Button & Progress */}
                  <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                        initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
              >

                        
                        {/* Compress Button */}
                        <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-3"
                >
                  {isCompressing ? (
                    <>
                      <div className="spinner-glow"></div>
                      <span>Compressing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                                <span>
                                  {compressionMode === 'smart' ? 'Smart Compress' : 
                                   compressionMode === 'custom' ? 'Custom Compress' : 'Compress Images'}
                                </span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
                        </div>
              </motion.div>
            )}
                  </AnimatePresence>
          </div>
              </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
              {compressedImages.length > 0 && (
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <div className="glass-panel rounded-2xl p-8 border border-white/[0.08]">
                            <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Compression Results</h3>
          <div className="flex items-center space-x-3">
            {/* History Button (Pro only) */}
            {isFeatureAvailable('compressionHistory') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FileImage className="w-4 h-4" />
                <span>History ({compressionHistory.length})</span>
              </motion.button>
            )}
            
            {/* ZIP Download Button (Pro only) */}
            {isFeatureAvailable('bulkDownload') && compressedImages.length > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadAllAsZip}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP</span>
              </motion.button>
            )}
            
            {/* Regular Download All */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadAll}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download All</span>
              {!isFeatureAvailable('bulkDownload') && subscriptionStatus.tier === 'free' && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
            </motion.button>
          </div>
        </div>
                
                    <div className="space-y-6">
                      {compressedImages.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-light rounded-xl p-6"
                        >
                          {/* Image comparison section - full width */}
                          <div className="w-full mb-6">
                            <div className="flex flex-col lg:flex-row lg:space-x-8 items-center justify-center">
                              {/* Original image */}
                              <div className="flex flex-col items-center mb-4 lg:mb-0">
                                <div className="relative">
                                  <img
                                    src={previewUrls[index]}
                                    alt={image.compressedFile.name + ' original'}
                                    className="w-40 h-40 lg:w-48 lg:h-48 object-contain rounded-lg border border-white/[0.1] shadow-lg"
                                    loading="lazy"
                                  />
                                  <div className="absolute -top-2 -left-2 bg-neutral-800/90 backdrop-blur-sm px-2 py-1 rounded-md border border-white/[0.1]">
                                    <span className="text-xs font-medium text-neutral-300">Original</span>
                                  </div>
                                </div>
                                <div className="mt-3 text-center">
                                  <div className="text-sm font-semibold text-neutral-300">{formatFileSize(image.originalSize)}</div>
                                  <div className="text-xs text-neutral-400">{image.dimensions.original.width}×{image.dimensions.original.height}</div>
                                </div>
                              </div>

                              {/* Arrow indicator */}
                              <div className="flex flex-col items-center mb-4 lg:mb-0">
                                <div className="w-12 h-12 gradient-bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-white text-xl font-bold">→</span>
                                </div>
                                <div className="mt-2 text-center">
                                  <div className="text-xs text-neutral-400">Compressed</div>
                                  <div className="text-xs text-emerald-400 font-medium">{Math.round(((image.originalSize - image.compressedSize) / image.originalSize) * 100)}% smaller</div>
                                </div>
                              </div>

                              {/* Compressed image */}
                              <div className="flex flex-col items-center mb-4 lg:mb-0">
                                <div className="relative">
                                  <img
                                    src={URL.createObjectURL(image.compressedFile)}
                                    alt={image.compressedFile.name + ' compressed'}
                                    className="w-40 h-40 lg:w-48 lg:h-48 object-contain rounded-lg border border-emerald-500/30 shadow-lg"
                                    loading="lazy"
                                  />
                                  <div className="absolute -top-2 -left-2 bg-emerald-600/90 backdrop-blur-sm px-2 py-1 rounded-md border border-emerald-400/30">
                                    <span className="text-xs font-medium text-white">Compressed</span>
                                  </div>
                                </div>
                                <div className="mt-3 text-center">
                                  <div className="text-sm font-semibold text-emerald-400">{formatFileSize(image.compressedSize)}</div>
                                  <div className="text-xs text-neutral-400">{image.dimensions.compressed.width}×{image.dimensions.compressed.height}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* File info and download section */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                              <div className="flex items-center space-x-2">
                                <FileImage className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-300">{image.compressedFile.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-neutral-300">Saved {formatFileSize(image.originalSize - image.compressedSize)}</span>
                              </div>
                            </div>
                            
                            {/* Download button */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownload(image)}
                              className="btn-primary text-sm px-6 py-3 flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Panel */}
            <AnimatePresence>
              {(selectedFiles.length > 0 || compressedImages.length > 0) && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Compression Stats</h3>
                      <p className="text-sm text-neutral-400">Performance metrics</p>
          </div>
        </div>

                  <div className="space-y-3">
                <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-300">Files selected</span>
                      <span className="text-sm font-semibold text-white">{selectedFiles.length}</span>
                </div>
                {compressedImages.length > 0 && (
                  <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-300">Original size</span>
                        <span className="text-sm font-semibold text-white">{formatFileSize(totalOriginalSize)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-300">Compressed size</span>
                      <span className="text-sm font-semibold text-emerald-400">{formatFileSize(totalCompressedSize)}</span>
                    </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-300">Space saved</span>
                          <span className="text-sm font-semibold text-blue-400">{formatFileSize(totalSaved)}</span>
                        </div>
                  </>
                )}
              </div>
            </motion.div>
              )}
            </AnimatePresence>

            {/* Features Panel */}
          <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-bg-accent rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Key Features</h3>
                  <p className="text-sm text-neutral-400">What makes us special</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Client-side processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Batch processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Drag & drop</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Format selection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Quality control</span>
                </div>
            </div>
          </motion.div>
          
          {/* Sidebar Ad Banner - Positioned after Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <SidebarAdBanner isPremium={subscriptionStatus.tier !== 'free'} />
          </motion.div>
        </div>
      </div>
    </main>

      {/* Bottom Ad Banner */}
      <BottomAdBanner isPremium={subscriptionStatus.tier !== 'free'} />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        trigger={premiumModalTrigger}
      />

      {/* Compression History Modal */}
      <CompressionHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={compressionHistory}
        onClearHistory={handleClearHistory}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-neutral-900/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <p className="text-sm text-neutral-400">Customize your experience</p>
                    </div>
                  </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(false)}
                  className="glass-button p-2 rounded-lg"
                >
                  <span className="text-white text-xl">×</span>
                </motion.button>
                    </div>

              <div className="space-y-6">
                {/* Default Compression Mode */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Default Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Default Compression Mode</label>
                      <select 
                        value={settings.defaultCompressionMode}
                        onChange={(e) => updateSetting('defaultCompressionMode', e.target.value as AppSettings['defaultCompressionMode'])}
                        className="w-full px-4 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50"
                        style={{ color: 'white' }}
                      >
                        <option value="preset">Preset Mode</option>
                        <option value="smart">Smart Mode</option>
                        <option value="custom">Custom Mode</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Default Quality Preset</label>
                      <select 
                        value={settings.defaultQualityPreset}
                        onChange={(e) => updateSetting('defaultQualityPreset', e.target.value as AppSettings['defaultQualityPreset'])}
                        className="w-full px-4 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50"
                        style={{ color: 'white' }}
                      >
                        <option value="balanced">Balanced</option>
                        <option value="highQuality">High Quality</option>
                        <option value="highCompression">High Compression</option>
                        <option value="maximumCompression">Maximum Compression</option>
                      </select>
                  </div>
                      </div>
                    </div>

                {/* UI Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Interface</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Show file size in results</div>
                        <div className="text-sm text-neutral-400">Display original and compressed file sizes</div>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          settings.showFileSizes ? 'bg-blue-500/20' : 'bg-white/[0.1]'
                        }`}
                        onClick={() => updateSetting('showFileSizes', !settings.showFileSizes)}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full absolute top-0.5 transition-transform ${
                            settings.showFileSizes ? 'bg-blue-500 translate-x-6' : 'bg-neutral-500 translate-x-0.5'
                          }`}
                        />
                </div>
              </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Auto-download after compression</div>
                        <div className="text-sm text-neutral-400">Automatically download compressed files</div>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                          settings.autoDownload ? 'bg-blue-500/20' : 'bg-white/[0.1]'
                        }`}
                        onClick={() => updateSetting('autoDownload', !settings.autoDownload)}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full absolute top-0.5 transition-transform ${
                            settings.autoDownload ? 'bg-blue-500 translate-x-6' : 'bg-neutral-500 translate-x-0.5'
                          }`}
                        />
                </div>
              </div>
              </div>
            </div>
            
                {/* Performance */}
            <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Max file size limit</label>
                      <select 
                        value={settings.maxFileSizeMB}
                        onChange={(e) => updateSetting('maxFileSizeMB', Number(e.target.value))}
                        className="w-full px-4 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50"
                        style={{ color: 'white' }}
                      >
                        <option value={10}>10 MB</option>
                        <option value={25}>25 MB</option>
                        <option value={50}>50 MB</option>
                        <option value={100}>100 MB</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Batch processing limit</label>
                      <select 
                        value={settings.maxBatchSize}
                        onChange={(e) => updateSetting('maxBatchSize', Number(e.target.value))}
                        className="w-full px-4 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50"
                        style={{ color: 'white' }}
                      >
                        <option value={10}>10 files</option>
                        <option value={25}>25 files</option>
                        <option value={50}>50 files</option>
                        <option value={100}>100 files</option>
                      </select>
              </div>
            </div>
          </div>
          
                {/* About */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                  <div className="space-y-3 text-sm text-neutral-400">
                    <div className="flex justify-between">
                      <span>Version</span>
                      <span>1.0.0</span>
          </div>
                    <div className="flex justify-between">
                      <span>Build</span>
                      <span>2024.01</span>
        </div>
                    <div className="flex justify-between">
                      <span>License</span>
                      <span>MIT</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-white/[0.1]">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(false)}
                  className="btn-secondary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowSettings(false);
                    toast.success('Settings saved!');
                  }}
                  className="btn-primary"
                >
                  Save Settings
                </motion.button>
    </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-neutral-900/50 border-t border-white/[0.1] mt-16">
        <div className="container-modern py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-white font-semibold mb-4">ShrinkMyPhoto</h3>
              <p className="text-neutral-400 text-sm mb-4">
                Free online image compression tool. Compress JPG, PNG, WebP images without losing quality. 
                Fast, secure, and easy to use image optimizer.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about.html" className="text-neutral-400 hover:text-white transition-colors">About</a></li>
                <li><a href="/faq.html" className="text-neutral-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/how-to-compress-images.html" className="text-neutral-400 hover:text-white transition-colors">How-To Guide</a></li>
                <li><a href="/contact.html" className="text-neutral-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy-policy.html" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service.html" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.1] mt-8 pt-6 text-center">
            <p className="text-neutral-500 text-sm">
              © 2025 ShrinkMyPhoto. All rights reserved. Free image compression tool.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App; 