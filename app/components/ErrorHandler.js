'use client';

import { useState, useEffect } from 'react';

export default function ErrorHandler({ error, onRetry, onDismiss }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    if (error) {
      setVisible(true);
    }
  }, [error]);
  
  if (!error || !visible) {
    return null;
  }
  
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };
  
  return (
    <div className="error-handler bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-grow">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error.message || 'An unexpected error occurred'}</p>
        </div>
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={handleDismiss}
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {onRetry && (
        <div className="mt-2">
          <button
            onClick={handleRetry}
            className="text-sm text-red-700 hover:text-red-900 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
