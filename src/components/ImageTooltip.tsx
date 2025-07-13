import React from 'react';
import { motion } from 'framer-motion';
import { formatFileSize } from '../utils/compression';
import { AnimatePresence } from 'framer-motion';

interface ImageTooltipProps {
  file: File;
  children: React.ReactNode;
  className?: string;
}

export const ImageTooltip: React.FC<ImageTooltipProps> = ({ file, children, className = '' }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
    
    return () => URL.revokeObjectURL(img.src);
  }, [file]);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-neutral-900/95 backdrop-blur-sm border border-white/[0.1] rounded-lg p-3 shadow-xl min-w-[200px]">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Name:</span>
                  <span className="text-white font-medium truncate ml-2 max-w-[120px]" title={file.name}>
                    {file.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Size:</span>
                  <span className="text-white">{formatFileSize(file.size)}</span>
                </div>
                {imageDimensions && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Dimensions:</span>
                    <span className="text-white">{imageDimensions.width}×{imageDimensions.height}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-400">Type:</span>
                  <span className="text-white">{file.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Modified:</span>
                  <span className="text-white">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900/95"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 