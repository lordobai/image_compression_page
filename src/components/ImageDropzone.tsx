import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, Sparkles, Camera, Zap, Files } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateFile, formatFileSize } from '../utils/compression';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  selectedFiles?: File[];
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  selectedFiles = [],
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File too large. Maximum size is ${formatFileSize(maxFileSize)}.`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Please upload only JPEG, PNG, or WebP images.');
      } else if (rejection.errors[0]?.code === 'too-many-files') {
        setError(`Maximum ${maxFiles} files allowed.`);
      }
      return;
    }

    // Validate files
    try {
      acceptedFiles.forEach(file => validateFile(file, maxFileSize));
      onFilesSelected(acceptedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid file');
    }
  }, [onFilesSelected, maxFileSize, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles,
    maxSize: maxFileSize,
    multiple: maxFiles > 1,
  });

  const rootProps = getRootProps();

  return (
    <div className="w-full">
      {/* File count indicator */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 glass-light rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center">
              <Files className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </h3>
              <p className="text-sm text-neutral-400">
                Total size: {formatFileSize(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilesSelected([])}
            className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </motion.button>
        </motion.div>
      )}

      <motion.div
        className={`dropzone-modern ${isDragActive ? 'dropzone-active' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: isDragActive 
            ? "0 0 60px rgba(59, 130, 246, 0.3)" 
            : "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}
        transition={{ duration: 0.3 }}
        onClick={rootProps.onClick}
        onKeyDown={rootProps.onKeyDown}
        onDragEnter={rootProps.onDragEnter}
        onDragLeave={rootProps.onDragLeave}
        onDragOver={rootProps.onDragOver}
        onDrop={rootProps.onDrop}
        role={rootProps.role}
        tabIndex={rootProps.tabIndex}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-8">
          {/* Animated icon container */}
          <motion.div
            className="relative"
            animate={{ 
              rotate: isDragActive ? 360 : 0,
              scale: isDragActive ? 1.1 : 1
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 gradient-bg-primary rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden">
              <AnimatePresence mode="wait">
            {isDragActive ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Upload className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Camera className="w-10 h-10 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <motion.div
                  className="absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full"
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.div
                  className="absolute top-4 right-3 w-1.5 h-1.5 bg-white/40 rounded-full"
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.4, 0.9, 0.4]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    delay: 0.5
                  }}
                />
                <motion.div
                  className="absolute bottom-3 left-4 w-1 h-1 bg-white/50 rounded-full"
                  animate={{ 
                    y: [0, -6, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.8, 
                    repeat: Infinity,
                    delay: 1
                  }}
                />
              </div>
            </div>
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{
                boxShadow: isDragActive 
                  ? "0 0 40px rgba(59, 130, 246, 0.6)" 
                  : "0 0 20px rgba(102, 126, 234, 0.3)"
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          
          {/* Text content */}
          <div className="text-center space-y-4">
            <motion.h3 
              className="text-2xl font-bold text-white"
              animate={{ 
                color: isDragActive ? "#3b82f6" : "#ffffff"
              }}
              transition={{ duration: 0.3 }}
            >
              {isDragActive ? 'Drop images here' : 'Upload your images'}
            </motion.h3>
            
            <motion.p 
              className="text-neutral-300 text-lg leading-relaxed"
              animate={{ 
                color: isDragActive ? "#60a5fa" : "#d1d5db"
              }}
              transition={{ duration: 0.3 }}
            >
              Drag & drop or click to select JPEG, PNG, or WebP files
            </motion.p>
            
                          {maxFiles > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-2 text-sm text-neutral-400"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Upgrade to Pro for batch upload</span>
              </motion.div>
            )}
          </div>
          
          {/* File info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
            <motion.div 
              className="glass-light p-4 rounded-xl text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 mb-1">Max file size</p>
              <p className="text-sm font-semibold text-white">{formatFileSize(maxFileSize)}</p>
            </motion.div>
            
            <motion.div 
              className="glass-light p-4 rounded-xl text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Image className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 mb-1">Formats</p>
              <p className="text-sm font-semibold text-white">JPEG, PNG, WebP</p>
            </motion.div>
            
            <motion.div 
              className="glass-light p-4 rounded-xl text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Upload className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 mb-1">Max files</p>
                              <p className="text-sm font-semibold text-white">{maxFiles}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 status-error rounded-2xl flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-red-300 text-sm flex-1">{error}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 