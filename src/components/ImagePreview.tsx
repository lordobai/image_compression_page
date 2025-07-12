import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, EyeOff, ArrowRight, TrendingDown, FileImage, Zap } from 'lucide-react';
import { CompressedImage } from '../types';

interface ImagePreviewProps {
  image: CompressedImage;
  onDownload: (image: CompressedImage) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onDownload }) => {
  const [showOriginal, setShowOriginal] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savedBytes = image.originalSize - image.compressedSize;
  const savedPercentage = image.originalSize > 0 ? (savedBytes / image.originalSize) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="card-modern group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-3 h-3 bg-emerald-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            <span className="text-sm font-semibold text-emerald-400">Compression Complete</span>
            <p className="text-xs text-neutral-400">Optimized successfully</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDownload(image)}
          className="btn-primary text-sm px-6 py-3 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </motion.button>
      </div>

      {/* Image Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Original Image */}
        <motion.div 
          className="space-y-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileImage className="w-4 h-4 text-neutral-400" />
              <h4 className="text-sm font-semibold text-white">Original</h4>
            </div>
            <span className="text-xs text-neutral-400 px-3 py-1 glass-light rounded-full">
              {formatFileSize(image.originalSize)}
            </span>
          </div>
          <div className="relative group overflow-hidden rounded-2xl">
            <img
              src={image.previewUrl}
              alt="Original"
              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowOriginal(!showOriginal)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 glass-button p-2 rounded-xl transition-all duration-300"
            >
              {showOriginal ? (
                <EyeOff className="w-4 h-4 text-white" />
              ) : (
                <Eye className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Compressed Image */}
        <motion.div 
          className="space-y-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">Compressed</h4>
            </div>
            <span className="text-xs text-emerald-400 px-3 py-1 status-success rounded-full font-medium">
              {formatFileSize(image.compressedSize)}
            </span>
          </div>
          <div className="relative group overflow-hidden rounded-2xl">
            <img
              src={image.compressedPreviewUrl}
              alt="Compressed"
              className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowOriginal(!showOriginal)}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 glass-button p-2 rounded-xl transition-all duration-300"
            >
              {showOriginal ? (
                <EyeOff className="w-4 h-4 text-white" />
              ) : (
                <Eye className="w-4 h-4 text-white" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Compression Stats */}
      <div className="glass-medium rounded-2xl p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          <h5 className="text-lg font-bold text-white">Compression Results</h5>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <motion.div 
            className="text-center p-4 glass-light rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="text-3xl font-black gradient-text-primary mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {isNaN(savedPercentage) || savedPercentage < 0 ? '0.0' : savedPercentage.toFixed(1)}%
            </motion.div>
            <div className="text-xs text-neutral-400">Size Reduced</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-4 glass-light rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="text-3xl font-black text-blue-400 mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            >
              {image.quality}%
            </motion.div>
            <div className="text-xs text-neutral-400">Quality</div>
          </motion.div>
        </div>
        
        {/* Progress bar showing compression */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Original: {formatFileSize(image.originalSize)}</span>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </motion.div>
            <span className="text-emerald-400 font-semibold">
              {formatFileSize(image.compressedSize)}
            </span>
          </div>
          
          <div className="progress-modern">
            <motion.div 
              className="progress-fill-modern"
              initial={{ width: 0 }}
              animate={{ width: `${isNaN(savedPercentage) || savedPercentage < 0 ? 0 : Math.min(savedPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          
          <div className="text-center">
            <span className="text-sm text-emerald-400 font-semibold">
              Saved {formatFileSize(Math.max(0, savedBytes))}
            </span>
            <div className="text-xs text-neutral-400 mt-1">
              Output: {image.format.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="mt-6 p-4 glass-light rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-neutral-400 mb-1">Format</p>
            <p className="text-sm font-semibold text-white">{image.format.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Quality</p>
            <p className="text-sm font-semibold text-blue-400">{image.quality}%</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-1">Saved</p>
            <p className="text-sm font-semibold text-emerald-400">{formatFileSize(savedBytes)}</p>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 