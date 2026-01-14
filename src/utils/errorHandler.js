/**
 * FatToFit Global Error Handler
 * Centralized error handling for the app
 */

import { Alert, Platform } from 'react-native';

// Error types for categorization
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  API: 'API',
  STORAGE: 'STORAGE',
  PERMISSION: 'PERMISSION',
  UNKNOWN: 'UNKNOWN',
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',       // Log only, don't interrupt user
  MEDIUM: 'medium', // Show toast/snackbar
  HIGH: 'high',     // Show alert, may need user action
  CRITICAL: 'critical', // App-breaking, needs restart
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.onErrorCallbacks = [];
  }

  /**
   * Log an error with context
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack,
      type: context.type || ErrorTypes.UNKNOWN,
      severity: context.severity || ErrorSeverity.MEDIUM,
      screen: context.screen,
      action: context.action,
      userId: context.userId,
      extra: context.extra,
    };

    // Add to local log
    this.errorLog.unshift(errorEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Console log in development
    if (__DEV__) {
      console.error('Error logged:', errorEntry);
    }

    // Notify listeners
    this.onErrorCallbacks.forEach((callback) => callback(errorEntry));

    // In production, would send to error tracking service (Sentry, etc.)
    // this.sendToErrorService(errorEntry);

    return errorEntry;
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error, context = {}) {
    const isOffline = !error.message?.includes('Network request failed');
    
    const errorEntry = this.logError(error, {
      ...context,
      type: ErrorTypes.NETWORK,
      severity: ErrorSeverity.MEDIUM,
    });

    return {
      ...errorEntry,
      userMessage: isOffline
        ? 'You appear to be offline. Please check your internet connection.'
        : 'Unable to connect to the server. Please try again.',
      isRetryable: true,
    };
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error, context = {}) {
    const errorEntry = this.logError(error, {
      ...context,
      type: ErrorTypes.AUTH,
      severity: ErrorSeverity.HIGH,
    });

    let userMessage = 'Authentication failed. Please try again.';
    let shouldLogout = false;

    if (error.message?.includes('expired') || error.message?.includes('invalid_token')) {
      userMessage = 'Your session has expired. Please sign in again.';
      shouldLogout = true;
    } else if (error.message?.includes('invalid_credentials')) {
      userMessage = 'Invalid email or password.';
    } else if (error.message?.includes('user_not_found')) {
      userMessage = 'No account found with this email.';
    }

    return {
      ...errorEntry,
      userMessage,
      shouldLogout,
      isRetryable: !shouldLogout,
    };
  }

  /**
   * Handle API errors
   */
  handleAPIError(error, context = {}) {
    const errorEntry = this.logError(error, {
      ...context,
      type: ErrorTypes.API,
      severity: ErrorSeverity.MEDIUM,
    });

    let userMessage = 'Something went wrong. Please try again.';
    let statusCode = error.status || error.statusCode;

    if (statusCode === 400) {
      userMessage = 'Invalid request. Please check your input.';
    } else if (statusCode === 401) {
      userMessage = 'Please sign in to continue.';
    } else if (statusCode === 403) {
      userMessage = "You don't have permission to do this.";
    } else if (statusCode === 404) {
      userMessage = 'The requested resource was not found.';
    } else if (statusCode === 429) {
      userMessage = 'Too many requests. Please wait a moment.';
    } else if (statusCode >= 500) {
      userMessage = 'Server error. Please try again later.';
    }

    return {
      ...errorEntry,
      userMessage,
      statusCode,
      isRetryable: statusCode >= 500 || statusCode === 429,
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error, context = {}) {
    const errorEntry = this.logError(error, {
      ...context,
      type: ErrorTypes.VALIDATION,
      severity: ErrorSeverity.LOW,
    });

    return {
      ...errorEntry,
      userMessage: error.message || 'Please check your input.',
      isRetryable: false,
      validationErrors: error.errors || [],
    };
  }

  /**
   * Handle storage errors
   */
  handleStorageError(error, context = {}) {
    const errorEntry = this.logError(error, {
      ...context,
      type: ErrorTypes.STORAGE,
      severity: ErrorSeverity.MEDIUM,
    });

    return {
      ...errorEntry,
      userMessage: 'Unable to save data locally. Please try again.',
      isRetryable: true,
    };
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(error, context = {}) {
    const errorEntry = this.logError(error, {
      ...context,
      type: ErrorTypes.PERMISSION,
      severity: ErrorSeverity.HIGH,
    });

    return {
      ...errorEntry,
      userMessage: error.message || 'Permission required to continue.',
      isRetryable: false,
      requiresSettings: true,
    };
  }

  /**
   * Show error alert to user
   */
  showErrorAlert(error, options = {}) {
    const {
      title = 'Error',
      message = 'Something went wrong.',
      showRetry = false,
      onRetry,
      onDismiss,
    } = options;

    const buttons = [
      {
        text: 'OK',
        onPress: onDismiss,
      },
    ];

    if (showRetry && onRetry) {
      buttons.unshift({
        text: 'Retry',
        onPress: onRetry,
      });
    }

    Alert.alert(
      title,
      typeof error === 'string' ? error : error.userMessage || message,
      buttons
    );
  }

  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Subscribe to errors
   */
  onError(callback) {
    this.onErrorCallbacks.push(callback);
    return () => {
      this.onErrorCallbacks = this.onErrorCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Create error boundary handler
   */
  createErrorBoundaryHandler(componentName) {
    return (error, errorInfo) => {
      this.logError(error, {
        type: ErrorTypes.UNKNOWN,
        severity: ErrorSeverity.CRITICAL,
        screen: componentName,
        extra: { componentStack: errorInfo?.componentStack },
      });
    };
  }
}

export default new ErrorHandler();

/**
 * Wrapper for async functions with error handling
 */
export const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handler = require('./errorHandler').default;
      const handledError = handler.logError(error, options);
      
      if (options.showAlert) {
        handler.showErrorAlert(handledError, {
          showRetry: options.isRetryable,
          onRetry: () => withErrorHandling(fn, options)(...args),
        });
      }
      
      if (options.rethrow) {
        throw error;
      }
      
      return options.fallback;
    }
  };
};

/**
 * React error boundary helper
 */
export const captureException = (error, context = {}) => {
  const handler = require('./errorHandler').default;
  return handler.logError(error, context);
};


