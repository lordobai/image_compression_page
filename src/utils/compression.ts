// @ts-expect-error: No types for upng-js
import UPNG from 'upng-js';
// Advanced image compression utilities
export interface CompressionOptions {
  quality: number; // 0-100
  format: 'jpeg' | 'webp' | 'png';
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  progressive?: boolean;
  optimize?: boolean;
}

export interface CompressionResult {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: {
    original: { width: number; height: number };
    compressed: { width: number; height: number };
  };
}

// Format detection and validation
export const getImageFormat = (file: File): string => {
  const type = file.type.toLowerCase();
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg';
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  if (type.includes('gif')) return 'gif';
  if (type.includes('bmp')) return 'bmp';
  return 'jpeg'; // default
};

export const isSupportedFormat = (file: File): boolean => {
  const format = getImageFormat(file);
  return ['jpeg', 'png', 'webp', 'gif', 'bmp'].includes(format);
};

// Calculate optimal dimensions while maintaining aspect ratio
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number } => {
  // If no max dimensions specified, return original dimensions
  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // Only resize if the image is larger than the max dimensions
  if (maxWidth && originalWidth > maxWidth) {
    newWidth = maxWidth;
    if (maintainAspectRatio) {
      newHeight = Math.round((originalHeight * maxWidth) / originalWidth);
    }
  }

  if (maxHeight && newHeight > maxHeight) {
    newHeight = maxHeight;
    if (maintainAspectRatio) {
      newWidth = Math.round((newWidth * maxHeight) / newHeight);
    }
  }

  // Ensure we never exceed original dimensions unless explicitly requested
  if (maintainAspectRatio) {
    if (newWidth > originalWidth) {
      newWidth = originalWidth;
      newHeight = originalHeight;
    }
    if (newHeight > originalHeight) {
      newWidth = originalWidth;
      newHeight = originalHeight;
    }
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
};

// Advanced compression with multiple format support
export const compressImage = async (
  file: File,
  options: CompressionOptions = { quality: 80, format: 'jpeg' }
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    // Check if image is already well-compressed
    if (isAlreadyCompressed(file)) {
      const originalFormat = getImageFormat(file);
      const result: CompressionResult = {
        originalFile: file,
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        format: originalFormat,
        dimensions: {
          original: { width: 0, height: 0 },
          compressed: { width: 0, height: 0 }
        }
      };
      resolve(result);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // Calculate new dimensions
        const { width, height } = calculateDimensions(
          originalWidth,
          originalHeight,
          options.maxWidth,
          options.maxHeight,
          options.maintainAspectRatio ?? true
        );
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Apply image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine output format and quality
        const format = options.format || 'jpeg';
        
        if (format === 'png') {
          // Use UPNG.js for real PNG compression
          // Get RGBA pixel data from canvas
          const imageData = ctx.getImageData(0, 0, width, height);
          const rgba = imageData.data.buffer;
          // Map quality to color depth for PNG compression
          let colorDepth = 256; // Default
          if (options.quality >= 90) colorDepth = 256;
          else if (options.quality >= 70) colorDepth = 128;
          else if (options.quality >= 40) colorDepth = 64;
          else if (options.quality >= 20) colorDepth = 32;
          else colorDepth = 16;
          // Encode PNG with UPNG.js
          const pngArrayBuffer = UPNG.encode([rgba], width, height, colorDepth);
          const pngBlob = new Blob([pngArrayBuffer], { type: 'image/png' });
          const originalName = file.name;
          const baseName = originalName.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}_compressed.png`;
          const compressedFile = new File([pngBlob], newFileName, {
            type: 'image/png',
            lastModified: Date.now(),
          });
          
          // Check if compression actually reduced file size
          if (compressedFile.size >= file.size) {
            // If compressed file is larger or same size, return original file
            const originalFormat = getImageFormat(file);
            const result: CompressionResult = {
              originalFile: file,
              compressedFile: file, // Return original file
              originalSize: file.size,
              compressedSize: file.size,
              compressionRatio: 0, // No compression achieved
              format: originalFormat,
              dimensions: {
                original: { width: originalWidth, height: originalHeight },
                compressed: { width: originalWidth, height: originalHeight }
              }
            };
            resolve(result);
            return;
          }
          
          // Calculate compression ratio, handle cases where PNG might be larger or original size is 0
          let compressionRatio = 0;
          if (file.size > 0) {
            compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
          }
          const result: CompressionResult = {
            originalFile: file,
            compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressionRatio,
            format,
            dimensions: {
              original: { width: originalWidth, height: originalHeight },
              compressed: { width, height }
            }
          };
          resolve(result);
        } else {
          // For JPEG and WebP, use quality settings
          const quality = Math.max(0, Math.min(1, options.quality / 100));
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const originalName = file.name;
                const baseName = originalName.replace(/\.[^/.]+$/, '');
                const newFileName = `${baseName}_compressed.${format}`;
                const compressedFile = new File([blob], newFileName, {
                  type: `image/${format}`,
                  lastModified: Date.now(),
                });
                
                // Check if compression actually reduced file size
                if (compressedFile.size >= file.size) {
                  // If compressed file is larger or same size, return original file
                  const originalFormat = getImageFormat(file);
                  const result: CompressionResult = {
                    originalFile: file,
                    compressedFile: file, // Return original file
                    originalSize: file.size,
                    compressedSize: file.size,
                    compressionRatio: 0, // No compression achieved
                    format: originalFormat,
                    dimensions: {
                      original: { width: originalWidth, height: originalHeight },
                      compressed: { width: originalWidth, height: originalHeight }
                    }
                  };
                  resolve(result);
                  return;
                }
                
                // Calculate compression ratio, handle cases where compressed file is larger or original size is 0
                let compressionRatio = 0;
                if (file.size > 0) {
                  compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
                }
                const result: CompressionResult = {
                  originalFile: file,
                  compressedFile,
                  originalSize: file.size,
                  compressedSize: compressedFile.size,
                  compressionRatio,
                  format,
                  dimensions: {
                    original: { width: originalWidth, height: originalHeight },
                    compressed: { width, height }
                  }
                };
                resolve(result);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            `image/${format}`,
            quality
          );
        }
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Batch compression
export const compressImages = async (
  files: File[],
  options: CompressionOptions
): Promise<CompressionResult[]> => {
  const results: CompressionResult[] = [];
  const total = files.length;
  
  for (let i = 0; i < total; i++) {
    try {
      const result = await compressImage(files[i], options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return results;
};

// Smart compression that automatically chooses the best format
export const smartCompress = async (
  file: File,
  targetSize?: number // Target size in bytes
): Promise<CompressionResult> => {
  const formats: Array<'jpeg' | 'webp' | 'png'> = ['webp', 'jpeg', 'png'];
  
  // Try different formats and qualities to find the best compression
  let bestResult: CompressionResult | null = null;
  
  for (const format of formats) {
    // Skip if browser doesn't support WebP
    if (format === 'webp' && !isWebPSupported()) {
      continue;
    }
    
    // More aggressive quality settings for better compression
    const qualities = [70, 60, 50, 40, 30, 20];
    
    for (const quality of qualities) {
      try {
        const result = await compressImage(file, { quality, format });
        
        // If we have a target size, check if we meet it
        if (targetSize && result.compressedSize <= targetSize) {
          return result;
        }
        
        // Keep track of the best result (smallest size with good quality)
        if (!bestResult || 
            (result.compressedSize < bestResult.compressedSize && result.compressionRatio > 0)) {
          bestResult = result;
        }
      } catch (error) {
        console.warn(`Failed to compress with ${format} at quality ${quality}:`, error);
      }
    }
  }
  
  if (!bestResult) {
    // If no compression was achieved, return original file
    const originalFormat = getImageFormat(file);
    const result: CompressionResult = {
      originalFile: file,
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      format: originalFormat,
      dimensions: {
        original: { width: 0, height: 0 },
        compressed: { width: 0, height: 0 }
      }
    };
    return result;
  }
  
  return bestResult;
};

// Check if image is already well-compressed
export const isAlreadyCompressed = (file: File): boolean => {
  const format = getImageFormat(file);
  
  // For WebP files, they're likely already well-compressed
  if (format === 'webp') {
    return true;
  }
  
  // For small files (< 100KB), they might already be optimized
  if (file.size < 100 * 1024) {
    return true;
  }
  
  return false;
};

// Check WebP support
export const isWebPSupported = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// File validation
export const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
  
  if (!supportedTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload JPEG, PNG, WebP, GIF, or BMP images.');
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size is ${formatFileSize(maxSize)}.`);
  }
  
  return true;
};

// Get compression statistics
export const getCompressionStats = (results: CompressionResult[]) => {
  const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const averageCompressionRatio = results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length;
  
  return {
    totalOriginalSize,
    totalCompressedSize,
    totalSaved,
    averageCompressionRatio,
    fileCount: results.length,
    formatBreakdown: results.reduce((acc, r) => {
      acc[r.format] = (acc[r.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};

// Preset compression options
export const compressionPresets = {
  highQuality: {
    quality: 75, // Reduced from 90 to 75 for better compression
    format: 'jpeg' as const,
    maxWidth: 1920,
    maxHeight: 1080,
    maintainAspectRatio: true,
    progressive: true,
    optimize: true
  },
  balanced: {
    quality: 65, // Reduced from 80 to 65 for better compression
    format: 'jpeg' as const,
    maxWidth: 1600,
    maxHeight: 900,
    maintainAspectRatio: true,
    progressive: true,
    optimize: true
  },
  highCompression: {
    quality: 50, // Reduced from 60 to 50 for better compression
    format: 'webp' as const,
    maxWidth: 1200,
    maxHeight: 675,
    maintainAspectRatio: true,
    progressive: true,
    optimize: true
  },
  maximumCompression: {
    quality: 30, // Reduced from 40 to 30 for maximum compression
    format: 'webp' as const,
    maxWidth: 800,
    maxHeight: 450,
    maintainAspectRatio: true,
    progressive: true,
    optimize: true
  }
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to download file
export const downloadFile = (file: File, filename: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 