import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Zap, 
  Settings, 
  Sparkles,
  Camera,
  Check,
  Download,
  BarChart3
} from 'lucide-react';

import { ImageDropzone } from './components/ImageDropzone';
import { CompressionSettings } from './components/CompressionSettings';
import { ImagePreview } from './components/ImagePreview';
import { SettingsModal } from './components/SettingsModal';
import { ThemeProvider } from './contexts/ThemeContext';

import { compressMultipleImages, downloadFile, formatFileSize } from './utils/compression';
import { CompressionOptions, CompressedImage } from './types';

// Main App Component
const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 80,
    format: 'auto',
    maintainAspectRatio: true,
  });

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setCompressedImages([]);
    toast.success(`Selected ${files.length} image${files.length > 1 ? 's' : ''}`);
  }, []);

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsCompressing(true);
    toast.loading('Compressing images...', { id: 'compression' });

    try {
      const results = await compressMultipleImages(selectedFiles, compressionOptions);
      setCompressedImages(results);
      toast.success(`Successfully compressed ${results.length} image${results.length > 1 ? 's' : ''}`, {
        id: 'compression',
      });
    } catch (error) {
      toast.error('Failed to compress images', { id: 'compression' });
      console.error('Compression error:', error);
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

  const handleDownloadAll = () => {
    compressedImages.forEach((image, index) => {
      setTimeout(() => {
        handleDownload(image);
      }, index * 100);
    });
    toast.success('Starting batch download...');
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
      
      {/* Header */}
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
                  Experience the future of image compression with our cutting-edge algorithms. Optimize your photos without losing quality, all wrapped in a stunning interface.
                </motion.p>
              </div>
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
                maxFiles={50}
                maxFileSize={50 * 1024 * 1024} // 50MB
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
            {/* Stats Panel */}
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
                  <span className="text-sm text-neutral-300">Multiple formats</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Quality preservation</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Results Section */}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadAll}
                      className="btn-primary w-full py-2 flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download All</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Compressed Images */}
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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="glass-panel border-t border-white/[0.08] mt-20"
      >
        <div className="container-modern py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-bg-primary rounded-xl flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ImageCompress</span>
              </div>
              <p className="text-sm text-neutral-400">
                Professional image compression powered by advanced algorithms. Optimize your photos with precision while maintaining quality.
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
              <h4 className="text-white font-semibold mb-4">Key Features</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <div>AI-powered compression</div>
                <div>Multiple format support</div>
                <div>Batch processing</div>
                <div>Real-time preview</div>
                <div>Quality preservation</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/[0.08] mt-8 pt-8 text-center text-sm text-neutral-400">
            <p>&copy; {new Date().getFullYear()} ImageCompress. All rights reserved. Built with modern web technologies.</p>
          </div>
        </div>
      </motion.footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        compressionOptions={compressionOptions}
        onCompressionOptionsChange={setCompressionOptions}
      />
    </div>
  );
};

// App Wrapper with Theme Provider
const AppWrapper: React.FC = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWrapper; 