/**
 * Application constants for validation rules, limits, and configuration
 */

export const VALIDATION = {
  PROJECT_NAME_MAX_LENGTH: 100,
  REFLECTION_MAX_LENGTH: 5000,
  MAX_IMAGES_PER_ENTRY: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
} as const;

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif'
] as const;

export const UI = {
  ERROR_DISPLAY_DURATION: 5000, // 5 seconds
  SUCCESS_DISPLAY_DURATION: 3000, // 3 seconds
} as const;

export const MESSAGES = {
  PROJECT_NAME_REQUIRED: 'Project name is required',
  PROJECT_NAME_TOO_LONG: `Project name must be less than ${VALIDATION.PROJECT_NAME_MAX_LENGTH} characters`,
  REFLECTION_REQUIRED: 'Reflection is required',
  REFLECTION_TOO_LONG: `Reflection must be less than ${VALIDATION.REFLECTION_MAX_LENGTH} characters`,
  FILE_SIZE_TOO_LARGE: 'File size must be less than 5MB',
  UNSUPPORTED_FILE_TYPE: 'Only JPEG, PNG, WebP, and GIF files are allowed',
  MAX_IMAGES_EXCEEDED: `Maximum ${VALIDATION.MAX_IMAGES_PER_ENTRY} images allowed`,
} as const;