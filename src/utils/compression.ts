import imageCompression from 'browser-image-compression';
import { CompressionOptions, CompressedImage } from '../types';

export const compressImage = async (
  file: File,
  options: CompressionOptions
): Promise<CompressedImage> => {
  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: Math.max(options.maxWidth || 1920, options.maxHeight || 1080),
    useWebWorker: true,
    fileType: `image/${options.format}`,
    quality: options.quality / 100,
    alwaysKeepResolution: !options.maintainAspectRatio,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Create preview URLs
    const originalPreviewUrl = URL.createObjectURL(file);
    const compressedPreviewUrl = URL.createObjectURL(compressedFile);
    
    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
    
    return {
      id: crypto.randomUUID(),
      originalFile: file,
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      quality: options.quality,
      format: options.format,
      previewUrl: originalPreviewUrl,
      compressedPreviewUrl,
    };
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Failed to compress image');
  }
};

export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions
): Promise<CompressedImage[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
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