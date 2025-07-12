import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { 
  Zap, 
  Crown, 
  Settings, 
  Sparkles,
  ArrowRight,
  BarChart3,
  Shield,
  Star,
  Camera,
  Lock,
  User,
  Check
} from 'lucide-react';

import { ImageDropzone } from './components/ImageDropzone';
import { CompressionSettings } from './components/CompressionSettings';
import { ImagePreview } from './components/ImagePreview';
import { PricingModal } from './components/PricingModal';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentCancel } from './components/PaymentCancel';
import { TopAdBanner, BottomAdBanner } from './components/AdBanner';
import { CustomUserButton } from './components/CustomUserButton';
import { SettingsModal } from './components/SettingsModal';
import { ThemeProvider } from './contexts/ThemeContext';

import { compressMultipleImages, downloadFile, formatFileSize } from './utils/compression';
import { CompressionOptions, CompressedImage } from './types';
import './clerk-overrides.css';

// Main App Component
const MainApp: React.FC = () => {
  const { user } = useUser();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 80,
    format: 'auto',
    maintainAspectRatio: true,
  });

  // Check subscription status on component mount and when user changes
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (!user) {
          // Reset subscription when user is not authenticated
          setIsPremium(false);
          setSubscriptionTier('free');
          return;
        }

        // Use user-specific localStorage key
        const userSubscriptionKey = `subscription_${user.id}`;
        const cachedSubscription = localStorage.getItem(userSubscriptionKey);
        
        if (cachedSubscription) {
          const subscription = JSON.parse(cachedSubscription);
          if (subscription.isActive) {
            setIsPremium(true);
            setSubscriptionTier(subscription.tier);
            return;
          }
        }

        // If no cached subscription or it's inactive, check with backend
        // Note: This would require user authentication to work properly
        // For now, we'll rely on localStorage
        setIsPremium(false);
        setSubscriptionTier('free');
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsPremium(false);
        setSubscriptionTier('free');
      }
    };

    checkSubscription();
  }, [user]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setCompressedImages([]);
  }, []);

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    console.log('=== COMPRESSION START DEBUG ===');
    console.log('Selected files:', selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    console.log('Current compression options:', compressionOptions);
    console.log('Quality setting:', compressionOptions.quality);
    console.log('Format setting:', compressionOptions.format);
    console.log('Maintain aspect ratio:', compressionOptions.maintainAspectRatio);

    setIsCompressing(true);
    toast.loading('Compressing...', { id: 'compression' });

    try {
      console.log('Calling compressMultipleImages with options:', compressionOptions);
      const results = await compressMultipleImages(selectedFiles, compressionOptions);
      console.log('Compression results:', results.map(r => ({
        originalSize: r.originalSize,
        compressedSize: r.compressedSize,
        compressionRatio: r.compressionRatio,
        quality: r.quality,
        format: r.format
      })));
      
      setCompressedImages(results);
      toast.success(`Successfully compressed ${results.length} image${results.length > 1 ? 's' : ''}`, {
        id: 'compression',
      });
      console.log('=== COMPRESSION END DEBUG ===');
    } catch (error) {
      toast.error('Failed to compress images', { id: 'compression' });
      console.error('Compression error:', error);
      console.log('=== COMPRESSION ERROR DEBUG ===');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = (image: CompressedImage) => {
    const originalName = image.originalFile.name;
    const extension = image.format;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const newFilename = `${baseName}_compressed.${extension}`;
    
    downloadFile(image.compressedFile, newFilename);
    toast.success('Download started!');
  };

  const handleSubscribe = async (tierId: string) => {
    // This will be handled by the Stripe payment flow
    setIsPremium(true);
    setShowPricing(false);
  };

  const totalOriginalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;

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
      
      {/* Ultra-modern header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel sticky top-0 z-50 border-b border-white/[0.08]"
      >
        <div className="container-modern">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-12 h-12 gradient-bg-primary rounded-2xl flex items-center justify-center shadow-2xl">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text-primary">ImageCompress</h1>
                <p className="text-xs text-neutral-400 font-mono">Pro Edition</p>
            </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              {/* Authentication */}
              <SignedOut>
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary text-sm flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign In</span>
                    </motion.button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary text-sm flex items-center space-x-2"
                    >
                      <span>Sign Up</span>
                      <ArrowRight className="w-3 h-3" />
                    </motion.button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center space-x-3">
              {!isPremium && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPricing(true)}
                      className="btn-primary text-sm flex items-center space-x-2"
                >
                      <Crown className="w-4 h-4" />
                      <span>Upgrade to Pro</span>
                      <Star className="w-3 h-3" />
                    </motion.button>
              )}
                  <CustomUserButton />
                </div>
              </SignedIn>
              
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                className="glass-button p-3 rounded-xl"
              >
                <Settings className="w-5 h-5 text-neutral-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Top Ad Banner */}
      <TopAdBanner isPremium={isPremium} />

      {/* Main Content */}
      <main className="container-modern py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Main Content - Upload & Settings */}
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
                  className="text-6xl font-black text-balance leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                Compress Images with{' '}
                  <span className="gradient-text-primary">Elegant Simplicity</span>
                </motion.h2>
                <motion.p 
                  className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Experience the future of image compression with our cutting-edge AI-powered algorithms. Optimize your photos without losing quality, all wrapped in a stunning interface.
                </motion.p>
              </div>
              
              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex items-center justify-center space-x-3 text-sm text-neutral-400"
                >
                  <Lock className="w-4 h-4" />
                  <span>Free tier: 10MB max, single upload</span>
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-blue-400">Pro: 50MB, batch upload</span>
                </motion.div>
              )}
            </motion.div>

            {/* Image Dropzone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <ImageDropzone
                onFilesSelected={handleFilesSelected}
                selectedFiles={selectedFiles}
                isPremium={isPremium}
                maxFiles={
                  subscriptionTier === 'enterprise' ? 1000 :
                  subscriptionTier === 'pro' ? 50 : 1
                }
                maxFileSize={
                  subscriptionTier === 'enterprise' ? 100 * 1024 * 1024 :
                  subscriptionTier === 'pro' ? 50 * 1024 * 1024 :
                  10 * 1024 * 1024
                }
              />
            </motion.div>

            {/* Compression Settings */}
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <CompressionSettings
                  options={compressionOptions}
                  onOptionsChange={setCompressionOptions}
                  isPremium={isPremium}
                />
              </motion.div>
            )}

            {/* Compress Button */}
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex justify-center"
              >
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
                      <span>Compress Images</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Right Column - Stats & Features */}
          <div className="space-y-8">
            {/* Premium Features */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="glass-panel rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                                      <h3 className="text-lg font-bold text-white">Unlock Pro Features</h3>
                  <p className="text-sm text-neutral-400">Get the full experience</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 gradient-bg-secondary rounded-lg flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-neutral-300">Batch upload (up to 50 images)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 gradient-bg-secondary rounded-lg flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-neutral-300">Larger files (up to 50MB)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 gradient-bg-secondary rounded-lg flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-neutral-300">Advanced compression options</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 gradient-bg-secondary rounded-lg flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-neutral-300">Ad-free experience</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPricing(true)}
                  className="w-full btn-primary"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Stats Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-bg-secondary rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Compression Stats</h3>
                  <p className="text-sm text-neutral-400">Your usage summary</p>
          </div>
        </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Files processed</span>
                  <span className="text-sm font-semibold text-white">{compressedImages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Total space saved</span>
                  <span className="text-sm font-semibold text-white">{formatFileSize(totalSaved)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">Average compression</span>
                  <span className="text-sm font-semibold text-white">
                    {compressedImages.length > 0 
                      ? ((totalSaved / totalOriginalSize) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>
                {compressedImages.length > 0 && (
                  <>
                    <div className="border-t border-white/[0.1] pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-300">Original size</span>
                        <span className="text-sm font-semibold text-white">{formatFileSize(totalOriginalSize)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-300">Compressed size</span>
                      <span className="text-sm font-semibold text-emerald-400">{formatFileSize(totalCompressedSize)}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Security Features */}
          <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-bg-accent rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Privacy & Security</h3>
                  <p className="text-sm text-neutral-400">Your data is safe</p>
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
                  <span className="text-sm text-neutral-300">No data uploaded</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Instant downloads</span>
                </div>
            </div>
          </motion.div>
          </div>
        </div>
      </main>

      {/* Results Section - COMPLETELY OUTSIDE MAIN CONTAINER */}
      {compressedImages.length > 0 && (
        <section className="w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12">
          <div className="container-modern">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-8"
            >
              {/* Summary Stats */}
              <div className="glass-panel rounded-2xl p-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text-primary">{selectedFiles.length}</div>
                    <div className="text-sm text-neutral-400">Images Processed</div>
                </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">
                      {((totalSaved / totalOriginalSize) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-neutral-400">Size Reduced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                        {formatFileSize(totalSaved)}
                    </div>
                    <div className="text-sm text-neutral-400">Space Saved</div>
                  </div>
                      </div>
                    </div>

              {/* Compressed Images - Full Width Cards */}
              <div className="w-full">
                <div className="space-y-6">
                  {compressedImages.map((image, index) => (
                    <ImagePreview
                      key={index}
                      image={image}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Bottom Ad Banner */}
      <BottomAdBanner isPremium={isPremium} />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="glass-panel border-t border-white/[0.08] mt-20"
      >
        <div className="container-modern py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-bg-primary rounded-xl flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ImageCompress</span>
              </div>
              <p className="text-sm text-neutral-400">
                Advanced image compression powered by cutting-edge technology. Optimize your images with elegance and precision.
              </p>
              <div className="flex items-center space-x-4 text-xs text-neutral-500">
                <span>Client-side processing</span>
                <span>•</span>
                <span>Privacy focused</span>
                <span>•</span>
                <span>Instant results</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <div>Smart compression</div>
                <div>Multiple formats</div>
                <div>Batch processing</div>
                <div>Quality control</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Cookie Policy</div>
                <div>Data Protection</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/[0.08] mt-8 pt-8 text-center text-sm text-neutral-400">
            <p>&copy; {new Date().getFullYear()} ImageCompress. All rights reserved. Built with modern web technologies.</p>
          </div>
        </div>
      </motion.footer>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSubscribe={handleSubscribe}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isPremium={isPremium}
        subscriptionTier={subscriptionTier}
        compressionOptions={compressionOptions}
        onCompressionOptionsChange={setCompressionOptions}
      />
    </div>
  );
};

// Router Wrapper
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/cancel" element={<PaymentCancel />} />
        {/* Debug route to test routing */}
        <Route path="/test" element={
          <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
            <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Test Route Working!</h1>
              <p className="text-neutral-300 mb-6">If you can see this, routing is working correctly.</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
        {/* Test success page (no auth required) */}
        <Route path="/test-success" element={
          <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
            <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Test Success Page</h1>
              <p className="text-neutral-300 mb-6">This is a test success page without authentication.</p>
              <p className="text-sm text-neutral-400 mb-4">URL: {window.location.href}</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
        {/* Debug environment info */}
        <Route path="/debug" element={
          <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
            <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Debug Information</h1>
              <div className="text-left space-y-2 text-sm text-neutral-300">
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                <p><strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL}</p>
                <p><strong>REACT_APP_ENABLE_TEST_MODE:</strong> {process.env.REACT_APP_ENABLE_TEST_MODE}</p>
                <p><strong>Hostname:</strong> {window.location.hostname}</p>
                <p><strong>Is Development:</strong> {
                  (process.env.NODE_ENV === 'development' || 
                   process.env.REACT_APP_ENABLE_TEST_MODE === 'true' ||
                   window.location.hostname === 'localhost') ? '✅ Yes' : '❌ No'
                }</p>
                <p><strong>Current URL:</strong> {window.location.href}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              </div>
              <a href="/" className="btn-primary mt-6">Go Home</a>
            </div>
          </div>
        } />
        {/* Catch all route for debugging */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
            <div className="glass-panel rounded-3xl p-8 max-w-2xl w-full text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
              <p className="text-neutral-300 mb-6">The page you're looking for doesn't exist.</p>
              <p className="text-sm text-neutral-400 mb-4">Current URL: {window.location.href}</p>
              <p className="text-sm text-neutral-400 mb-4">Pathname: {window.location.pathname}</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
        </Router>
    </ThemeProvider>
  );
};

export default App; 