import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Calendar, FileImage, Trash2 } from 'lucide-react';
import { CompressionHistoryItem } from '../utils/subscription';
import { formatFileSize } from '../utils/compression';

interface CompressionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CompressionHistoryItem[];
  onClearHistory: () => void;
}

export const CompressionHistoryModal: React.FC<CompressionHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory
}) => {
  const handleDownload = (item: CompressionHistoryItem) => {
    if (item.compressedFileUrl) {
      const link = document.createElement('a');
      link.href = item.compressedFileUrl;
      link.download = item.originalFilename.replace(/\.[^/.]+$/, '') + '_compressed.' + item.format;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-neutral-900/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 gradient-bg-primary rounded-xl flex items-center justify-center">
              <FileImage className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Compression History</h2>
              <p className="text-sm text-neutral-400">Your recent compressions</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="glass-button p-2 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <FileImage className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">No compression history</h3>
            <p className="text-neutral-400">Your compression history will appear here after you compress some images.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-light rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Preview */}
                    {item.compressedFileUrl && (
                      <img
                        src={item.compressedFileUrl}
                        alt={item.originalFilename}
                        className="w-16 h-16 object-cover rounded-lg border border-white/[0.1]"
                      />
                    )}
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate" title={item.originalFilename}>
                        {item.originalFilename}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-neutral-400 mt-1">
                        <span>{formatFileSize(item.originalSize)} → {formatFileSize(item.compressedSize)}</span>
                        <span className="text-emerald-400">{item.compressionRatio.toFixed(1)}% saved</span>
                        <span className="text-purple-400 uppercase">{item.format}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {item.compressedFileUrl && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(item)}
                        className="btn-primary text-sm px-3 py-1"
                        title="Download compressed file"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        {history.length > 0 && (
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/[0.1]">
            <p className="text-sm text-neutral-400">
              {history.length} item{history.length !== 1 ? 's' : ''} in history
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClearHistory}
              className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}; 