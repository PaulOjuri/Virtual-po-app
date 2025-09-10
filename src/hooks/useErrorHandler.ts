import { useCallback, useState } from 'react';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  message: string | null;
  code?: string | number;
}

export interface UseErrorHandlerReturn {
  error: ErrorState;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  handleAsyncError: <T>(promise: Promise<T>) => Promise<T | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    message: null,
    code: undefined
  });

  const setError = useCallback((errorInput: Error | string | null) => {
    if (!errorInput) {
      setErrorState({
        hasError: false,
        error: null,
        message: null,
        code: undefined
      });
      return;
    }

    if (typeof errorInput === 'string') {
      setErrorState({
        hasError: true,
        error: new Error(errorInput),
        message: errorInput,
        code: undefined
      });
    } else {
      setErrorState({
        hasError: true,
        error: errorInput,
        message: errorInput.message,
        code: (errorInput as any).code || (errorInput as any).status
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      message: null,
      code: undefined
    });
  }, []);

  const handleAsyncError = useCallback(async <T>(promise: Promise<T>): Promise<T | null> => {
    try {
      clearError();
      return await promise;
    } catch (error) {
      console.error('Async error caught:', error);
      setError(error as Error);
      return null;
    }
  }, [clearError, setError]);

  return {
    error,
    setError,
    clearError,
    handleAsyncError
  };
};

export default useErrorHandler;