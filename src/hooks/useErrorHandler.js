import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error('Error occurred:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // API error response
      errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
    } else if (error.message) {
      // JavaScript error
      errorMessage = error.message;
    }
    
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};