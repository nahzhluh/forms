/**
 * Compress an image file to reduce storage size while maintaining reasonable quality
 */
export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxWidth / height);
      
      // Only resize if the image is larger than maxWidth
      if (ratio < 1) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
      
      // Draw and compress the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          // Fallback to original file if compression fails
          console.log(`Image compression failed for ${file.name}, using original`);
          resolve(file);
        }
      }, file.type, quality);
    };

    img.onerror = () => {
      // Fallback to original file if image loading fails
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
};