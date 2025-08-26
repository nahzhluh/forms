import { useState } from 'react';
import { UI } from '../constants';

export interface FormState {
  isLoading: boolean;
  error: string;
  success: boolean;
}

export interface UseFormStateReturn extends FormState {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: boolean) => void;
  resetState: () => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

/**
 * Custom hook for managing common form states (loading, error, success)
 * Includes auto-clearing of error and success messages after a timeout
 */
export const useFormState = (): UseFormStateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError('');
    setSuccess(false);
    setIsLoading(false);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess(false);
    setTimeout(() => setError(''), UI.ERROR_DISPLAY_DURATION);
  };

  const showSuccess = (message: string) => {
    setSuccess(true);
    setError('');
    setTimeout(() => setSuccess(false), UI.SUCCESS_DISPLAY_DURATION);
  };

  return {
    isLoading,
    error,
    success,
    setIsLoading,
    setError,
    setSuccess,
    resetState,
    showError,
    showSuccess,
  };
};