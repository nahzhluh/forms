import React, { useState } from 'react';
import { MediaItem } from '../types';

interface MediaGridProps {
  media: MediaItem[];
  className?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ media, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (media.length === 0) {
    return null;
  }

  const handleImageClick = (item: MediaItem) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {media.map((item) => {
          const hasError = imageErrors.has(item.id);
          
          return (
            <div
              key={item.id}
              className="relative group cursor-pointer"
              onClick={() => !hasError && handleImageClick(item)}
            >
              {hasError ? (
                <div className="w-full h-32 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-neutral-400 text-2xl mb-1">📷</div>
                    <div className="text-xs text-neutral-500">Image unavailable</div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.dataUrl}
                  alt={item.fileName}
                  className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  onError={() => handleImageError(item.id)}
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
              <p className="text-xs text-neutral-500 mt-1 truncate">
                {item.fileName}
              </p>
            </div>
          );
        })}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.dataUrl}
              alt={selectedImage.fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              {selectedImage.fileName}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
