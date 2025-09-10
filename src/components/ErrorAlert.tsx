import React from 'react';
import { AlertTriangle, X, RefreshCw, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { ErrorState } from '../hooks/useErrorHandler';

interface ErrorAlertProps {
  error: ErrorState;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  dismissible?: boolean;
  retryable?: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  onRetry,
  className = '',
  type = 'error',
  title,
  dismissible = true,
  retryable = false
}) => {
  if (!error.hasError && type === 'error') {
    return null;
  }

  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-sky-50 border-sky-200 text-sky-800';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-sky-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'success':
        return 'Success';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getAlertStyles()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {getTitle()}
          </h3>
          
          {error.message && (
            <div className="mt-1 text-sm">
              {error.message}
            </div>
          )}

          {error.code && (
            <div className="mt-1 text-xs opacity-75">
              Error Code: {error.code}
            </div>
          )}

          {(retryable || onRetry) && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {dismissible && onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;