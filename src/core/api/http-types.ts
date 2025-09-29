// types/http-types.ts
/**
 * HTTP TRANSPORT LAYER TYPES
 * 
 * This file contains HTTP client and request/response specific types.
 * These are the "how" - the transport layer details for making HTTP requests.
 * 
 * Key characteristics:
 * - HTTP transport layer implementation details
 * - Lower-level HTTP client types
 * - Depends on axios and core models
 * - Defines how requests are structured and processed
 * 
 * Used by: HTTP client, interceptors, and transport layer services
 */
import { InternalAxiosRequestConfig } from 'axios';
import { ApiRequestMetadata } from './models';

/**
 * Axios-specific request configuration
 * Extends Axios InternalAxiosRequestConfig with our custom metadata
 * Used internally by the HTTP client and interceptors
 */
export interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata: ApiRequestMetadata | null;  // Custom request metadata
}

/**
 * Standard API response wrapper
 * Common response format used across all API endpoints
 */
export interface GeneralResponseModel<T = unknown> {
  token: string | null;                // Access token (if included)
  refreshToken: string | null;         // Refresh token (if included)
  message: string | null;              // Response message
  error: string | string[] | null;                // Error message (if any)
  success: boolean | null;             // Success status
  data: T | null;                      // Response payload
}

/**
 * Error response model
 * Standardized error response format
 */
export interface GeneralResponseErrorModel {
  message: string | null;              // Error message
  errors: string | string[] | null;                // Error details
  success: boolean | null;             // Always false for errors
}

/**
 * Generic request model
 * Standard request structure for API calls
 */
export interface GeneralRequestModel<T, P = unknown, E = unknown> {
  body: T | null;                      // Request body data
  params: P | null;                    // URL parameters
  extra: E | null;                     // Additional request data
}

/**
 * Token refresh response
 * New tokens returned after successful refresh
 */
export interface RefreshTokenResponse {
  token: string | null;                // New access token
  refreshToken: string | null;         // New refresh token
}

/**
 * Pending request queue item
 * Used for queuing requests during token refresh
 */
export interface PendingRequest {
  resolve: (value: unknown) => void;   // Promise resolve function
  reject: (reason: any | null) => void; // Promise reject function
  config: CustomInternalAxiosRequestConfig; // Original request config
}

/**
 * HTTP client configuration
 * Settings for the HTTP client instance
 */
export interface HttpClientConfig {
  baseURL: string;                     // Base URL for all requests
  timeout: number;                     // Default request timeout
  refreshTokenTimeout: number | null;  // Token refresh timeout
}

/**
 * Error message mapping
 * Maps HTTP status codes to user-friendly error messages
 */
export interface ErrorMessageMap {
  [key: number]: string;               // Status code -> Error message
}

/**
 * Default error messages
 * Predefined error messages for common HTTP status codes
 */
export const DEFAULT_ERROR_MESSAGES: ErrorMessageMap = {
  401: 'Unauthorized access. Please login again.',
  403: 'Forbidden. You don\'t have permission to access this resource.',
  404: 'Resource not found. Please try again.',
  400: 'Bad request. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again.',
  502: 'Bad gateway error. Please contact support.',
  504: 'Server timed out. Please try again.',
}; 


