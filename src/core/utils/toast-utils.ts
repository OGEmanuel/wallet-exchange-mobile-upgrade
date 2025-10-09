// utils/toast.utils.ts
import { Alert, Platform, ToastAndroid, type AlertButton } from 'react-native';

/**
 * Toast Types
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export enum ToastDuration {
  SHORT = 'short',
  LONG = 'long',
  CUSTOM = 'custom'
}

export interface ToastOptions {
  type?: ToastType;
  duration?: ToastDuration;
  customDuration?: number;
  title?: string;
  action?: {
    text: string;
    onPress: () => void;
  };
  accessibility?: {
    label?: string;
    hint?: string;
  };
}

/**
 * Enhanced Toast Utility
 * 
 * Provides customizable toast notifications with:
 * - Multiple toast types (success, error, warning, info)
 * - Customizable duration and appearance
 * - Accessibility support
 * - Action buttons
 * - Platform-specific implementations
 * 
 * @example
 * ```typescript
 * showToast('Operation successful', { type: ToastType.SUCCESS });
 * showToast('Error occurred', { 
 *   type: ToastType.ERROR, 
 *   action: { text: 'Retry', onPress: () => retry() }
 * });
 * ```
 */

/**
 * Shows a toast notification with customizable options
 * @param message - Message to display
 * @param options - Toast configuration options
 */
export const showToast = (message: string, options: ToastOptions = {}): void => {
  const {
    type = ToastType.INFO,
    duration = ToastDuration.SHORT,
    customDuration,
    title,
    action,
    accessibility
  } = options;

  const displayMessage = title ? `${title}: ${message}` : message;
  const accessibilityLabel = accessibility?.label || `${type} notification: ${message}`;
  const accessibilityHint = accessibility?.hint || (action ? `Double tap to ${action.text.toLowerCase()}` : 'Double tap to dismiss');

  if (Platform.OS === 'android') {
    // ToastAndroid only supports SHORT or LONG. Passing numbers causes HostFunction errors.
    let androidDuration = ToastAndroid.SHORT;
    if (duration === ToastDuration.LONG) {
      androidDuration = ToastAndroid.LONG;
    } else if (duration === ToastDuration.CUSTOM) {
      console.warn('[Toast] Android CUSTOM duration is not supported; using LONG instead.');
      androidDuration = ToastAndroid.LONG;
    }

    try {
      // Ensure message is a string to satisfy native module expectations
      ToastAndroid.show(String(displayMessage), androidDuration);
    } catch (err) {
      console.error('[ToastAndroid] Exception in HostFunction while showing toast', {
        error: err,
        displayMessage,
        androidDuration,
        typeofMessage: typeof displayMessage,
      });
    }
  } else {
    // iOS implementation with Alert
    const alertTitle = getAlertTitle(type, title);
    const alertButtons = getAlertButtons(action);
    
    Alert.alert(alertTitle, displayMessage, alertButtons);
  }
};

/**
 * Shows an error toast
 * @param message - Error message
 * @param options - Additional options
 */
export const showErrorToast = (message: string, options: Omit<ToastOptions, 'type'> = {}): void => {
  showToast(message, { ...options, type: ToastType.ERROR });
};

/**
 * Shows a success toast
 * @param message - Success message
 * @param options - Additional options
 */
export const showSuccessToast = (message: string, options: Omit<ToastOptions, 'type'> = {}): void => {
  showToast(message, { ...options, type: ToastType.SUCCESS });
};

/**
 * Shows a warning toast
 * @param message - Warning message
 * @param options - Additional options
 */
export const showWarningToast = (message: string, options: Omit<ToastOptions, 'type'> = {}): void => {
  showToast(message, { ...options, type: ToastType.WARNING });
};

/**
 * Shows an info toast
 * @param message - Info message
 * @param options - Additional options
 */
export const showInfoToast = (message: string, options: Omit<ToastOptions, 'type'> = {}): void => {
  showToast(message, { ...options, type: ToastType.INFO });
};

/**
 * Gets the appropriate alert title based on toast type
 * @param type - Toast type
 * @param customTitle - Custom title if provided
 * @returns string - Alert title
 */
const getAlertTitle = (type: ToastType, customTitle?: string): string => {
  if (customTitle) return customTitle;
  
  switch (type) {
    case ToastType.SUCCESS:
      return 'Success';
    case ToastType.ERROR:
      return 'Error';
    case ToastType.WARNING:
      return 'Warning';
    case ToastType.INFO:
    default:
      return 'Info';
  }
};

/**
 * Gets alert buttons based on action options
 * @param action - Action configuration
 * @returns Alert button array
 */
const getAlertButtons = (action?: ToastOptions['action']) => {
  if (!action) {
    const buttons: AlertButton[] = [{ text: 'OK', style: 'default' }];
    return buttons;
  }
  
  const buttons: AlertButton[] = [
    { text: 'Cancel', style: 'cancel' },
    { text: action.text, style: 'default', onPress: action.onPress }
  ];
  return buttons;
};

