// utils/format.utils.ts
/**
 * Format Utilities
 * 
 * Provides comprehensive formatting functions for data display
 * 
 * Features:
 * - Currency, number, date formatting
 * - Text formatting and truncation
 * - Address formatting
 * - Internationalization support
 * 
 * @example
 * ```typescript
 * const formattedCurrency = formatCurrency(1234.56, 'USD');
 * const formattedDate = formatDate(new Date());
 * ```
 */

/**
 * Formats currency values with 2 decimal places
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns string - Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Formats numbers with specified decimal places
 * @param number - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale string (default: 'en-US')
 * @returns string - Formatted number string
 */
export const formatNumber = (
  number: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Formats large numbers with K, M, B suffixes
 * @param number - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns string - Formatted number with suffix
 */
export const formatLargeNumber = (number: number, decimals: number = 1): string => {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(decimals) + 'B';
  }
  if (number >= 1e6) {
    return (number / 1e6).toFixed(decimals) + 'M';
  }
  if (number >= 1e3) {
    return (number / 1e3).toFixed(decimals) + 'K';
  }
  return number.toString();
};

/**
 * Formats dates with customizable options
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale string (default: 'en-US')
 * @returns string - Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale: string = 'en-US'
): string => {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObject);
};

/**
 * Formats time with relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns string - Relative time string
 */
export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

/**
 * Formats wallet address with ellipsis
 * @param address - Wallet address to format
 * @param startLength - Number of characters to show at start (default: 6)
 * @param endLength - Number of characters to show at end (default: 4)
 * @returns string - Formatted address
 */
export const formatWalletAddress = (
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  
  const start = address.substring(0, startLength);
  const end = address.substring(address.length - endLength);
  return `${start}...${end}`;
};

/**
 * Formats phone number with standard format
 * @param phone - Phone number to format
 * @param country - Country code (default: 'US')
 * @returns string - Formatted phone number
 */
export const formatPhoneNumber = (phone: string, country: string = 'US'): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (country === 'US' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, -10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  return phone;
};

/**
 * Formats file size in human-readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Truncates text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns string - Truncated text
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes first letter of each word
 * @param text - Text to capitalize
 * @returns string - Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Formats percentage values
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns string - Formatted percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formats duration in human-readable format
 * @param seconds - Duration in seconds
 * @returns string - Formatted duration
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
