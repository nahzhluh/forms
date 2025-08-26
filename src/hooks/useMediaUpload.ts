import { useState, useRef } from 'react';
import { validateImageFile, convertFileToDataUrl } from '../utils';
import { VALIDATION, MESSAGES } from '../constants';

export interface UseMediaUploadReturn {
  images: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

/**
 * Custom hook for handling image upload functionality
 * Includes validation, file processing, and state management
 */
export const useMediaUpload = (
  maxImages: number = VALIDATION.MAX_IMAGES_PER_ENTRY,
  existingMediaCount: number = 0,
  onError?: (message: string) => void
): UseMediaUploadReturn => {
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.isValid) {
        const totalWithNewFiles = existingMediaCount + images.length;
        if (totalWithNewFiles + validFiles.length < maxImages) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${MESSAGES.MAX_IMAGES_EXCEEDED} (${existingMediaCount} existing + ${images.length} new + ${validFiles.length} being added)`);
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }

    if (errors.length > 0 && onError) {
      onError(errors.join(', '));
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    images,
    fileInputRef,
    handleImageUpload,
    removeImage,
    clearImages,
  };
};