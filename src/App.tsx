import React, { useState, useCallback } from 'react';
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
      <header className="bg-neutral-900/50 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ImageCompress</h1>
                <p className="text-xs text-neutral-400">Pro Edition</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
            >
              <Settings className="w-5 h-5 text-neutral-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-6xl font-black text-balance leading-tight text-white">
                  Compress Images with{' '}
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Elegant Simplicity
                  </span>
                </h2>
                <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
                  Experience the future of image compression with our cutting-edge algorithms. Optimize your photos without losing quality, all wrapped in a stunning interface.
                </p>
              </div>
            </div>

            {/* Image Dropzone */}
            <div>
              <ImageDropzone
                onFilesSelected={handleFilesSelected}
                selectedFiles={selectedFiles}
                maxFiles={50}
                maxFileSize={50 * 1024 * 1024} // 50MB
              />
            </div>

            {/* Compression Settings */}
            {selectedFiles.length > 0 && (
              <div>
                <CompressionSettings
                  options={compressionOptions}
                  onOptionsChange={setCompressionOptions}
                />
              </div>
            )}

            {/* Compress Button */}
            {selectedFiles.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-8 py-4 rounded-xl flex items-center space-x-3 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isCompressing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Compressing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>Compress Images</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Stats Panel */}
            {(selectedFiles.length > 0 || compressedImages.length > 0) && (
              <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
              </div>
            )}

            {/* Features Panel */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Key Features</h3>
                  <p className="text-sm text-neutral-400">What makes us special</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Client-side processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Batch processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Multiple formats</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-neutral-300">Quality preservation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Results Section */}
      {compressedImages.length > 0 && (
        <section className="w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{selectedFiles.length}</div>
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
                    <button
                      onClick={handleDownloadAll}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-full py-2 rounded-xl flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download All</span>
                    </button>
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
            </div>
          </div>
        </section>
      )}

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