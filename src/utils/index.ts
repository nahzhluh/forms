// Utility functions for the Forms platform

// Date utilities
export const formatDate = (date: string | Date): string => {
  let d: Date;
  
  if (typeof date === 'string') {
    if (date.includes('T')) {
      // Handle ISO timestamp format (e.g., "2023-01-01T00:00:00.000Z")
      d = new Date(date);
    } else {
      // Handle YYYY-MM-DD format properly
      const [year, month, day] = date.split('-').map(Number);
      d = new Date(year, month - 1, day); // month is 0-indexed
    }
  } else {
    d = date;
  }
  
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// File utilities
export const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
  }

  return { isValid: true };
};

export const compressImage = async (file: File, maxWidth = 1200): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxWidth / height);
      
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, 0.8);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Validation utilities
export const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Project name is required' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Project name must be less than 100 characters' };
  }
  
  return { isValid: true };
};

export const validateReflection = (reflection: string): { isValid: boolean; error?: string } => {
  if (!reflection.trim()) {
    return { isValid: false, error: 'Reflection is required' };
  }
  
  if (reflection.length > 5000) {
    return { isValid: false, error: 'Reflection must be less than 5000 characters' };
  }
  
  return { isValid: true };
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Array utilities
export const sortByDate = <T extends { date?: string; createdAt?: string }>(items: T[], ascending = false): T[] => {
  return [...items].sort((a, b) => {
    const dateA = a.date || a.createdAt || '';
    const dateB = b.date || b.createdAt || '';
    
    if (ascending) {
      return dateA.localeCompare(dateB);
    } else {
      return dateB.localeCompare(dateA);
    }
  });
};

// Error handling
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Local storage utilities
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Responsive utilities
export const getBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};
