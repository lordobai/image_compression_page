import { CompressionOptions, CompressedImage } from '../types';
import imageCompression from 'browser-image-compression';

// Enhanced compression strategies for different quality levels
const getCompressionStrategy = (quality: number) => {
  if (quality <= 30) {
    return {
      quality: 0.15,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.6,
      alwaysKeepResolution: false
    };
  } else if (quality <= 60) {
    return {
      quality: 0.4,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.7,
      alwaysKeepResolution: false
    };
  } else if (quality <= 80) {
    return {
      quality: 0.6,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.8,
      alwaysKeepResolution: true
    };
  } else {
    return {
      quality: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.9,
      alwaysKeepResolution: true
    };
  }
};

// Smart format detection and optimization
const optimizeImageFormat = async (file: File, options: CompressionOptions): Promise<File> => {
  const isPNG = file.type === 'image/png';
  
  console.log('=== SMART FORMAT OPTIMIZATION ===');
  console.log('Original file type:', file.type);
  console.log('Original file size:', file.size, 'bytes');
  
  // Strategy 1: Try WebP conversion (best compression for most images)
  try {
    console.log('Attempting WebP conversion...');
    const strategy = getCompressionStrategy(options.quality);
    const webpResult = await imageCompression(file, {
      maxWidthOrHeight: strategy.maxWidthOrHeight,
      useWebWorker: true,
      alwaysKeepResolution: strategy.alwaysKeepResolution,
      fileType: 'image/webp'
    });
    
    if (webpResult.size < file.size) {
      console.log('WebP conversion successful, size reduced by', ((file.size - webpResult.size) / file.size * 100).toFixed(2) + '%');
      return webpResult;
    } else {
      console.log('WebP conversion increased file size, trying next strategy...');
    }
  } catch (error) {
    console.log('WebP conversion failed, trying next strategy...');
  }
  
  // Strategy 2: For PNGs, try PNG optimization
  if (isPNG) {
    try {
      console.log('Attempting PNG optimization...');
      const strategy = getCompressionStrategy(options.quality);
      const pngOptimized = await imageCompression(file, {
        maxWidthOrHeight: strategy.maxWidthOrHeight,
        useWebWorker: true,
        alwaysKeepResolution: true,
        fileType: 'image/png'
      });
      
      if (pngOptimized.size < file.size) {
        console.log('PNG optimization successful, size reduced by', ((file.size - pngOptimized.size) / file.size * 100).toFixed(2) + '%');
        return pngOptimized;
      } else {
        console.log('PNG optimization increased file size, trying JPEG conversion...');
      }
    } catch (error) {
      console.log('PNG optimization failed, trying JPEG conversion...');
    }
  }
  
  // Strategy 3: Try JPEG conversion (good for photos, not ideal for graphics)
  try {
    console.log('Attempting JPEG conversion...');
    const strategy = getCompressionStrategy(options.quality);
    const jpegResult = await imageCompression(file, {
      maxWidthOrHeight: strategy.maxWidthOrHeight,
      useWebWorker: true,
      alwaysKeepResolution: strategy.alwaysKeepResolution,
      fileType: 'image/jpeg'
    });
    
    if (jpegResult.size < file.size) {
      console.log('JPEG conversion successful, size reduced by', ((file.size - jpegResult.size) / file.size * 100).toFixed(2) + '%');
      return jpegResult;
    } else {
      console.log('JPEG conversion increased file size, using original...');
    }
  } catch (error) {
    console.log('JPEG conversion failed, using original...');
  }
  
  // Strategy 4: If all else fails, try basic optimization without format change
  try {
    console.log('Attempting basic optimization...');
    const strategy = getCompressionStrategy(options.quality);
    const basicOptimized = await imageCompression(file, {
      maxWidthOrHeight: strategy.maxWidthOrHeight,
      useWebWorker: true,
      alwaysKeepResolution: strategy.alwaysKeepResolution
    });
    
    if (basicOptimized.size < file.size) {
      console.log('Basic optimization successful, size reduced by', ((file.size - basicOptimized.size) / file.size * 100).toFixed(2) + '%');
      return basicOptimized;
    }
  } catch (error) {
    console.log('Basic optimization failed...');
  }
  
  // Fallback: Return original file if no optimization worked
  console.log('No optimization strategy worked, returning original file');
  return file;
};

// Advanced compression with multiple attempts and best result selection
const compressImageAdvanced = async (
  file: File,
  options: CompressionOptions
): Promise<File> => {
  console.log('=== ADVANCED COMPRESSION SYSTEM ===');
  console.log('Original file:', file.name, file.size, 'bytes');
  console.log('Target quality:', options.quality);
  console.log('Target format:', options.format);

  const results: Array<{ file: File; size: number; method: string; compressionRatio: number; format: string }> = [];

  // Method 1: Smart format optimization (for auto mode)
  if (options.format === 'auto') {
    try {
      const smartResult = await optimizeImageFormat(file, options);
      const compressionRatio = file.size > 0 ? ((file.size - smartResult.size) / file.size) * 100 : 0;
      results.push({
        file: smartResult,
        size: smartResult.size,
        method: 'Smart Format Optimization',
        compressionRatio,
        format: smartResult.type.split('/')[1] || 'unknown',
      });
      console.log('Smart optimization result:', compressionRatio.toFixed(2) + '% reduction');
    } catch (error) {
      console.error('Smart optimization failed:', error);
    }
  }

  // Method 2: Direct format conversion to user-selected format (always run if not auto)
  if (options.format !== 'auto') {
    try {
      const strategy = getCompressionStrategy(options.quality);
      const directResult = await imageCompression(file, {
        maxWidthOrHeight: strategy.maxWidthOrHeight,
        useWebWorker: true,
        alwaysKeepResolution: strategy.alwaysKeepResolution,
        fileType: `image/${options.format}`
      });
      const compressionRatio = file.size > 0 ? ((file.size - directResult.size) / file.size) * 100 : 0;
      results.push({
        file: directResult,
        size: directResult.size,
        method: `Direct ${options.format.toUpperCase()} Conversion`,
        compressionRatio,
        format: options.format,
      });
      console.log('Direct conversion result:', compressionRatio.toFixed(2) + '% reduction');
    } catch (error) {
      console.error('Direct conversion failed:', error);
    }
  }

  // Method 3: Canvas-based compression (fallback, only for user-selected format)
  if (options.format !== 'auto') {
    try {
      const canvasResult = await compressImageWithCanvas(file, options);
      const compressionRatio = file.size > 0 ? ((file.size - canvasResult.size) / file.size) * 100 : 0;
      results.push({
        file: canvasResult,
        size: canvasResult.size,
        method: 'Canvas-based Compression',
        compressionRatio,
        format: options.format,
      });
      console.log('Canvas compression result:', compressionRatio.toFixed(2) + '% reduction');
    } catch (error) {
      console.error('Canvas compression failed:', error);
    }
  }

  // Select the result to return
  if (results.length === 0) {
    console.log('No compression methods worked, returning original file');
    return file;
  }

  let bestResult;
  if (options.format === 'auto') {
    // In auto mode, pick the smallest file (best compression ratio)
    results.sort((a, b) => b.compressionRatio - a.compressionRatio);
    bestResult = results[0];
  } else {
    // In explicit format mode, pick the best result for the user's format
    // (all results will be in the user's format)
    results.sort((a, b) => b.compressionRatio - a.compressionRatio);
    bestResult = results[0];
  }

  console.log('Best compression method:', bestResult.method);
  console.log('Final compression ratio:', bestResult.compressionRatio.toFixed(2) + '%');
  console.log('Final file size:', bestResult.size, 'bytes');
  return bestResult.file;
};

// Legacy canvas-based compression (kept as fallback)
const compressImageWithCanvas = async (
  file: File,
  options: CompressionOptions
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      console.log('Canvas compression - Original dimensions:', img.width, 'x', img.height);
      
      const strategy = getCompressionStrategy(options.quality);
      
      // Calculate new dimensions
      let newWidth = img.width;
      let newHeight = img.height;
      
      if (!strategy.alwaysKeepResolution) {
        const maxDimension = strategy.maxWidthOrHeight;
        if (img.width > maxDimension || img.height > maxDimension) {
          const aspectRatio = img.width / img.height;
          if (img.width > img.height) {
            newWidth = maxDimension;
            newHeight = Math.round(maxDimension / aspectRatio);
          } else {
            newHeight = maxDimension;
            newWidth = Math.round(maxDimension * aspectRatio);
          }
        }
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw image
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${options.format}`,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas compression failed - empty result'));
          }
        },
        `image/${options.format}`,
        strategy.quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image for canvas compression'));
    img.src = URL.createObjectURL(file);
  });
};

export const compressImage = async (
  file: File,
  options: CompressionOptions
): Promise<CompressedImage> => {
  console.log('=== ROBUST COMPRESSION SYSTEM ===');
  console.log('Original file size:', file.size, 'bytes');
  console.log('Original file type:', file.type);
  console.log('Compression options:', options);
  
  try {
    // Use the advanced compression system
    const compressedFile = await compressImageAdvanced(file, options);
    
    // Validate result
    if (compressedFile.size === 0) {
      throw new Error('Compression resulted in empty file');
    }
    
    console.log('Compressed file size:', compressedFile.size, 'bytes');
    
    // Create preview URLs
    const originalPreviewUrl = URL.createObjectURL(file);
    const compressedPreviewUrl = URL.createObjectURL(compressedFile);
    
    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;
    
    // Determine actual format used
    const actualFormat = compressedFile.type.split('/')[1] || options.format;
    
    const result = {
      id: crypto.randomUUID(),
      originalFile: file,
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      quality: options.quality,
      format: actualFormat,
      previewUrl: originalPreviewUrl,
      compressedPreviewUrl,
    };
    
    console.log('Final result:', {
      originalSize,
      compressedSize,
      compressionRatio: compressionRatio.toFixed(2) + '%',
      actualFormat
    });
    console.log('=== END ROBUST COMPRESSION SYSTEM ===');
    
    return result;
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions
): Promise<CompressedImage[]> => {
  console.log('Compressing multiple images with robust system');
  console.log('Options:', options);
  
  const compressionPromises = files.map((file, index) => {
    console.log(`Compressing file ${index + 1}/${files.length}:`, file.name);
    return compressImage(file, options);
  });
  
  return Promise.all(compressionPromises);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getSupportedFormats = (): string[] => {
  return ['jpeg', 'png', 'webp'];
};

export const validateFile = (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!supportedTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload JPEG, PNG, or WebP images.');
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size is ${formatFileSize(maxSize)}.`);
  }
  
  return true;
};

export const downloadFile = (file: File, filename: string): void => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const createZipDownload = async (compressedImages: CompressedImage[]): Promise<void> => {
  // This would require a zip library like JSZip
  // For now, we'll download files individually
  compressedImages.forEach((image, index) => {
    const originalName = image.originalFile.name;
    const extension = image.format;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const newFilename = `${baseName}_compressed.${extension}`;
    
    downloadFile(image.compressedFile, newFilename);
  });
}; 