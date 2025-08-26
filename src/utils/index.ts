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

export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

