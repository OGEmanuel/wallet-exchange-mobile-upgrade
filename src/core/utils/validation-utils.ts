// utils/validation.utils.ts
/**
 * Validation Utilities
 * 
 * Provides comprehensive input validation functions for forms and data
 * 
 * Features:
 * - Email, phone, password validation
 * - Custom validation rules
 * - Error message generation
 * - Type-safe validation results
 * 
 * @example
 * ```typescript
 * const emailResult = validateEmail('user@example.com');
 * const passwordResult = validatePassword('MyPassword123!');
 * ```
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordValidationResult extends ValidationResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
}

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns boolean - True if valid email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns boolean - True if valid phone
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validates password strength with detailed feedback
 * @param password - Password to validate
 * @returns PasswordValidationResult - Validation result with strength analysis
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
    score -= 1;
  }

  if (/123|abc|qwe/i.test(password)) {
    errors.push('Password should not contain common sequences');
    score -= 1;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 4) {
    strength = 'weak';
  } else if (score < 6) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, score)
  };
};

/**
 * Validates wallet address format
 * @param address - Wallet address to validate
 * @param type - Type of wallet (bitcoin, ethereum, etc.)
 * @returns boolean - True if valid address
 */
export const validateWalletAddress = (address: string, type: 'bitcoin' | 'ethereum' | 'generic' = 'generic'): boolean => {
  if (!address || typeof address !== 'string') return false;

  switch (type) {
    case 'bitcoin':
      // Bitcoin address validation (simplified)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
             /^bc1[a-z0-9]{39,59}$/.test(address);
    
    case 'ethereum':
      // Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    
    default:
      // Generic validation - at least 20 characters
      return address.length >= 20;
  }
};

/**
 * Validates seed phrase format
 * @param seedPhrase - Seed phrase to validate
 * @param wordCount - Expected word count (12, 15, 18, 21, 24)
 * @returns ValidationResult - Validation result
 */
export const validateSeedPhrase = (seedPhrase: string, wordCount: number = 12): ValidationResult => {
  const errors: string[] = [];
  
  if (!seedPhrase || typeof seedPhrase !== 'string') {
    errors.push('Seed phrase is required');
    return { isValid: false, errors };
  }

  const words = seedPhrase.trim().split(/\s+/);
  
  if (words.length !== wordCount) {
    errors.push(`Seed phrase must contain exactly ${wordCount} words`);
  }

  if (words.some(word => word.length === 0)) {
    errors.push('Seed phrase contains empty words');
  }

  if (words.some(word => !/^[a-z]+$/.test(word))) {
    errors.push('Seed phrase must contain only lowercase letters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates private key format
 * @param privateKey - Private key to validate
 * @param type - Type of private key (hex, wif, etc.)
 * @returns boolean - True if valid private key
 */
export const validatePrivateKey = (privateKey: string, type: 'hex' | 'wif' = 'hex'): boolean => {
  if (!privateKey || typeof privateKey !== 'string') return false;

  switch (type) {
    case 'hex':
      return /^[a-fA-F0-9]{64}$/.test(privateKey);
    
    case 'wif':
      // WIF format validation (simplified)
      return privateKey.length >= 51 && privateKey.length <= 52;
    
    default:
      return false;
  }
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns boolean - True if valid URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates JSON string
 * @param jsonString - JSON string to validate
 * @returns boolean - True if valid JSON
 */
export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult - Validation result
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult - Validation result
 */
export const validateLength = (
  value: string, 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (value.length > maxLength) {
    errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
