// types/socket-types.ts
/**
 * SOCKET TYPES
 * 
 * This file contains WebSocket/real-time communication types and interfaces.
 * These are separate from core API models as they handle real-time data flow.
 * 
 * Key characteristics:
 * - Real-time communication contracts
 * - Event-driven architecture types
 * - Socket connection management
 * - Independent of HTTP API layer
 * 
 * Used by: Socket client, real-time features, and live data components
 */

/**
 * Socket event handler function
 * Callback for handling incoming socket events
 */
export interface SocketEventHandler {
  (data: any): void;                   // Event data handler
}

/**
 * Socket error handler function
 * Callback for handling socket connection errors
 */
export interface SocketErrorHandler {
  (error: Error): void;                // Error handler
}

/**
 * Socket event types
 * Standard socket events for connection management
 */
export enum SocketEvents {
  CONNECT = 'connect',                 // Connection established
  DISCONNECT = 'disconnect',           // Connection lost
  CONNECT_ERROR = 'connect_error',     // Connection error
  RECONNECT = 'reconnect',             // Reconnection successful
  RECONNECT_ATTEMPT = 'reconnect_attempt', // Reconnection attempt
  RECONNECT_ERROR = 'reconnect_error', // Reconnection failed
  RECONNECT_FAILED = 'reconnect_failed', // All reconnection attempts failed
}
