import React, { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Camera, Download, Settings, Zap } from 'lucide-react';

// Simple image compression function
const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// File size formatter
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Download file function
const downloadFile = (file: File, filename: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

interface CompressedImage {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(80);
  
  const qualityPresets = [
    { value: 90, label: 'High Quality', description: 'Minimal compression' },
    { value: 80, label: 'Balanced', description: 'Good balance' },
    { value: 60, label: 'High Compression', description: 'Significant savings' },
    { value: 40, label: 'Maximum Compression', description: 'Smallest size' },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select image files');
      return;
    }
    
    setSelectedFiles(imageFiles);
    setCompressedImages([]);
    toast.success(`Selected ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}`);
  }, []);

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsCompressing(true);
    toast.loading('Compressing images...', { id: 'compression' });

    try {
      const results: CompressedImage[] = [];
      
      for (const file of selectedFiles) {
        const compressedFile = await compressImage(file, quality / 100);
        const originalSize = file.size;
        const compressedSize = compressedFile.size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
        
        results.push({
          originalFile: file,
          compressedFile,
          originalSize,
          compressedSize,
          compressionRatio,
        });
      }
      
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
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const newFilename = `${baseName}_compressed.jpg`;
    
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">ImageCompress</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">
                Compress Images with{' '}
                <span className="text-blue-400">Elegant Simplicity</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Experience the future of image compression. Optimize your photos without losing quality.
              </p>
            </div>

            {/* File Upload */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h3>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-300">{file.name}</span>
                          <span className="text-gray-400">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Presets */}
                {selectedFiles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Compression Quality</label>
                    <div className="grid grid-cols-2 gap-2">
                      {qualityPresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setQuality(preset.value)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            quality === preset.value
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <div className="font-medium text-sm">{preset.label}</div>
                          <div className="text-xs opacity-75">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compress Button */}
                {selectedFiles.length > 0 && (
                  <button
                    onClick={handleCompress}
                    disabled={isCompressing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    {isCompressing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Compressing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Compress Images</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            {compressedImages.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Compression Results</h3>
                  <button
                    onClick={handleDownloadAll}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {compressedImages.map((image, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{image.originalFile.name}</span>
                        <button
                          onClick={() => handleDownload(image)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Download
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Original:</span>
                          <div className="text-white">{formatFileSize(image.originalSize)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Compressed:</span>
                          <div className="text-green-400">{formatFileSize(image.compressedSize)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Saved:</span>
                          <div className="text-blue-400">{image.compressionRatio.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {(selectedFiles.length > 0 || compressedImages.length > 0) && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="font-medium mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Files:</span>
                    <span className="text-white">{selectedFiles.length}</span>
                  </div>
                  {compressedImages.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Original Size:</span>
                        <span className="text-white">{formatFileSize(totalOriginalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Compressed Size:</span>
                        <span className="text-green-400">{formatFileSize(totalCompressedSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Space Saved:</span>
                        <span className="text-blue-400">{formatFileSize(totalSaved)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Reduction:</span>
                        <span className="text-blue-400">
                          {((totalSaved / totalOriginalSize) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="font-medium mb-4">Features</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Client-side processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Batch processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Quality control</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Instant download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App; 