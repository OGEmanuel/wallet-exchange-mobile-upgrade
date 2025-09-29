// services/socket.client.ts
import { AppState, AppStateStatus } from 'react-native';
import { storageService } from '../storage/app-storage';
import {
  StorageKeys
} from '../storage/storage-types';
import {
  TokenData
} from './models';
import {
  SocketEventHandler,
  SocketEvents
} from './socket-types';
const io = require('socket.io-client');

interface EventSubscription {
  event: string;
  handler: SocketEventHandler;
  id: string;
}

/**
 * SocketClient - A comprehensive WebSocket client for React Native applications
 * 
 * Features:
 * - Automatic reconnection with configurable attempts
 * - App state awareness (foreground/background handling)
 * - Authentication token management
 * - Event subscription management
 * - Connection health monitoring
 * - Cleanup and resource management
 * 
 * @example
 * ```typescript
 * // Initialize and connect
 * await socketClient.initialize();
 * await socketClient.connect();
 * 
 * // Subscribe to events
 * const subscriptionId = socketClient.subscribe('user-message', (data) => {
 *   console.log('Received message:', data);
 * });
 * 
 * // Emit events
 * socketClient.emit('send-message', { text: 'Hello!' });
 * 
 * // Unsubscribe
 * socketClient.unsubscribe('user-message', subscriptionId);
 * 
 * // Check connection status
 * const status = socketClient.getConnectionStatus();
 * console.log('Connected:', status.isConnected);
 * 
 * // Cleanup when done
 * socketClient.cleanup();
 * ```
 */
class SocketClient {
  private socket: any = null;
  private socketUrl: string;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isInitialized = false;
  private appStateSubscription: any;

  constructor(socketUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL || '') {
    this.socketUrl = socketUrl;
    this.setupAppStateListener();
  }

  /**
   * Sets up app state listener to handle foreground/background transitions
   */
  private setupAppStateListener(): void {
    // Handle app state changes for React Native
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  /**
   * Handles app state changes to manage socket connection
   * @param nextAppState - The new app state
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active') {
      // App came to foreground, reconnect if needed
      if (this.socket && !this.socket.connected) {
        console.log('[SOCKET] App became active, attempting to reconnect...');
        this.connect();
      }
    } else if (nextAppState === 'background') {
      // App went to background, you might want to disconnect or reduce activity
      console.log('[SOCKET] App went to background');
    }
  }

  /**
   * Initializes the socket client
   * @returns Promise<boolean> - True if initialization successful
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (!this.socketUrl) {
      console.error('[SOCKET] No socket URL provided');
      return false;
    }

    try {
      await this.createSocketInstance();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[SOCKET] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Creates the socket instance with authentication and configuration
   */
  private async createSocketInstance(): Promise<void> {
    console.log('[SOCKET] Creating socket instance with URL:', this.socketUrl);

    try {
      const tokenData = await storageService.get<TokenData>(StorageKeys.TOKEN_DATA);
      const token = tokenData?.token;

      if (token) {
        console.log('[SOCKET] Auth token available for socket connection');
      } else {
        console.warn('[SOCKET] No auth token available for socket connection');
      }

      // Create socket with configuration optimized for React Native
      this.socket = io(this.socketUrl, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 60000,
        forceNew: true,
        transports: ['websocket', 'polling'], // Websocket first, fallback to polling
        auth: token ? {
          token: `Bearer ${token}`,
          authorization: `Bearer ${token}`,
        } : {},
      });

      this.setupSocketEventHandlers();

    } catch (error) {
      console.error('[SOCKET] Error creating socket instance:', error);
      throw error;
    }
  }

  /**
   * Sets up event handlers for socket connection events
   */
  private setupSocketEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on(SocketEvents.CONNECT, () => {
      this.reconnectAttempts = 0;
      console.log('[SOCKET] Connected successfully ✅');
      console.log('[SOCKET] Socket ID:', this.socket!.id);
    });

    this.socket.on(SocketEvents.DISCONNECT, (reason: string) => {
      console.warn('[SOCKET] Disconnected ❌ Reason:', reason);

      if (reason === 'io server disconnect') {
        console.warn('[SOCKET] Server disconnected, attempting to reconnect...');
        this.connect();
      }
    });

    this.socket.on(SocketEvents.CONNECT_ERROR, (error: any) => {
      console.error('[SOCKET] Connection error ⚠️:', error);
      
      console.warn('[SOCKET] Error details:', {
        name: error.name,
        message: error.message,
        type: error.type,
      });
    });

    this.socket.on(SocketEvents.RECONNECT_ATTEMPT, (attempt: number) => {
      this.reconnectAttempts = attempt;
      console.warn(`[SOCKET] Attempting to reconnect (${attempt}/${this.maxReconnectAttempts})...`);
      
      // Update auth token on each reconnect attempt
      this.updateAuthToken();
    });

    this.socket.on(SocketEvents.RECONNECT, (attempt: number) => {
      this.reconnectAttempts = 0;
      console.log(`[SOCKET] Reconnected after ${attempt} attempts ✅`);
    });

    this.socket.on(SocketEvents.RECONNECT_ERROR, (error: any) => {
      console.error('[SOCKET] Reconnection error ⚠️:', error);
    });

    this.socket.on(SocketEvents.RECONNECT_FAILED, () => {
      console.error('[SOCKET] Failed to reconnect after all attempts ❌');
    });

    // Handle ping-pong for connection health
    this.socket.on('ping-check', (callback: () => void) => {
      console.log('[SOCKET] Ping check received');
      if (callback && typeof callback === 'function') {
        callback();
      }
    });
  }

  /**
   * Updates the authentication token for reconnection attempts
   */
  private async updateAuthToken(): Promise<void> {
    try {
      const tokenData = await storageService.get<TokenData>(StorageKeys.TOKEN_DATA);
      if (tokenData?.token && this.socket) {
        this.socket.auth = { 
          token: `Bearer ${tokenData.token}`,
          authorization: `Bearer ${tokenData.token}`,
        };
        console.log('[SOCKET] Auth token updated for reconnection');
      }
    } catch (error) {
      console.error('[SOCKET] Failed to update auth token:', error);
    }
  }

  /**
   * Connects to the socket server
   * @returns Promise<boolean> - True if connection successful
   */
  async connect(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
    }

    if (!this.socket) {
      console.error('[SOCKET] No socket instance available');
      return false;
    }

    if (this.socket.connected) {
      console.log('[SOCKET] Already connected');
      return true;
    }

    return new Promise((resolve) => {
      const connectTimeout = setTimeout(() => {
        console.warn('[SOCKET] Connection timeout');
        resolve(false);
      }, 10000);

      this.socket!.once(SocketEvents.CONNECT, () => {
        clearTimeout(connectTimeout);
        console.log('[SOCKET] Connected successfully');
        resolve(true);
      });

      this.socket!.once(SocketEvents.CONNECT_ERROR, (error: any) => {
        clearTimeout(connectTimeout);
        console.error('[SOCKET] Connection failed:', error);
        resolve(false);
      });

      console.log('[SOCKET] Attempting to connect...');
      this.socket!.connect();
    });
  }

  /**
   * Disconnects from the socket server
   */
  disconnect(): void {
    if (this.socket && this.socket.connected) {
      console.log('[SOCKET] Disconnecting...');
      this.socket.disconnect();
    }
  }

  /**
   * Subscribes to a socket event
   * @param event - The event name to subscribe to
   * @param handler - The event handler function
   * @returns string - Subscription ID for unsubscribing
   */
  subscribe(event: string, handler: SocketEventHandler): string {
    if (!this.socket) {
      console.error('[SOCKET] Cannot subscribe - no socket instance');
      return '';
    }

    const subscriptionId = `${event}_${Date.now()}_${Math.random()}`;
    const subscription: EventSubscription = {
      event,
      handler,
      id: subscriptionId
    };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    this.subscriptions.get(event)!.push(subscription);
    
    console.log(`[SOCKET] Subscribing to event: ${event}`);
    this.socket.on(event, handler);

    return subscriptionId;
  }

  /**
   * Unsubscribes from a socket event
   * @param event - The event name to unsubscribe from
   * @param subscriptionId - Optional subscription ID to remove specific handler
   */
  unsubscribe(event: string, subscriptionId?: string): void {
    if (!this.socket) {
      console.error('[SOCKET] Cannot unsubscribe - no socket instance');
      return;
    }

    const eventSubscriptions = this.subscriptions.get(event);
    if (!eventSubscriptions) {
      return;
    }

    if (subscriptionId) {
      // Remove specific subscription
      const subscriptionIndex = eventSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (subscriptionIndex !== -1) {
        const subscription = eventSubscriptions[subscriptionIndex];
        this.socket.off(event, subscription.handler);
        eventSubscriptions.splice(subscriptionIndex, 1);
        
        if (eventSubscriptions.length === 0) {
          this.subscriptions.delete(event);
        }
        
        console.log(`[SOCKET] Unsubscribed from event: ${event} (ID: ${subscriptionId})`);
      }
    } else {
      // Remove all subscriptions for this event
      eventSubscriptions.forEach(subscription => {
        this.socket!.off(event, subscription.handler);
      });
      this.subscriptions.delete(event);
      console.log(`[SOCKET] Unsubscribed from all handlers for event: ${event}`);
    }
  }

  /**
   * Emits an event to the socket server
   * @param event - The event name to emit
   * @param data - Optional data to send with the event
   */
  emit(event: string, data?: any): void {
    if (!this.socket) {
      console.error('[SOCKET] Cannot emit - no socket instance');
      return;
    }

    if (!this.socket.connected) {
      console.warn('[SOCKET] Cannot emit - socket not connected');
      return;
    }

    console.log(`[SOCKET] Emitting event: ${event}`, data);
    this.socket.emit(event, data);
  }

  /**
   * Checks if the socket is currently connected
   * @returns boolean - True if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Gets the current socket ID
   * @returns string | null - The socket ID or null if not connected
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Gets the number of reconnection attempts
   * @returns number - Number of reconnection attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Cleans up resources and disconnects the socket
   * Should be called when the app is shutting down
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.subscriptions.clear();
    this.isInitialized = false;
    this.reconnectAttempts = 0;
    
    console.log('[SOCKET] Cleanup completed');
  }

  /**
   * Updates the socket URL (useful for environment switching)
   * @param newUrl - The new socket URL
   */
  updateSocketUrl(newUrl: string): void {
    this.socketUrl = newUrl;
    console.log('[SOCKET] Socket URL updated:', newUrl);
  }

  /**
   * Gets the current connection status
   * @returns Object containing connection status information
   */
  getConnectionStatus(): {
    isConnected: boolean;
    socketId: string | null;
    reconnectAttempts: number;
    isInitialized: boolean;
  } {
    return {
      isConnected: this.isConnected(),
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts,
      isInitialized: this.isInitialized
    };
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;