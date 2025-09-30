// services/error-reporting.ts
/**
 * Error Reporting Service
 * 
 * Handles error reporting to external services and provides comprehensive error tracking
 * 
 * Features:
 * - Multiple error reporting providers (Sentry, Bugsnag, etc.)
 * - Error categorization and severity levels
 * - User context and device information
 * - Offline error queuing
 * - Privacy-compliant error reporting
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  API = 'api',
  STORAGE = 'storage',
  UI = 'ui',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  userAgent?: string;
  timestamp: number;
  url?: string;
  action?: string;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ErrorReportingConfig {
  enabled: boolean;
  providers: ErrorReportingProvider[];
  maxQueueSize: number;
  batchSize: number;
  flushInterval: number;
  privacyMode: boolean;
}

export interface ErrorReportingProvider {
  name: string;
  enabled: boolean;
  report(error: ErrorReport): Promise<void>;
  flush(): Promise<void>;
}

class ErrorReportingService {
  private config: ErrorReportingConfig;
  private providers: ErrorReportingProvider[] = [];
  private errorQueue: ErrorReport[] = [];
  private flushTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enabled: true,
      providers: [],
      maxQueueSize: 100,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      privacyMode: false,
      ...config
    };

    this.initializeProviders();
    this.startFlushTimer();
  }

  /**
   * Initialize error reporting providers
   */
  private initializeProviders(): void {
    // Add Sentry provider if available (React Native compatible)
    if (this.isSentryAvailable()) {
      this.addProvider(new SentryErrorProvider());
    }

    // Add console provider for development
    if (__DEV__) {
      this.addProvider(new ConsoleErrorProvider());
    }
  }

  /**
   * Check if Sentry is available (React Native compatible)
   * @returns boolean - True if Sentry is available
   */
  private isSentryAvailable(): boolean {
    // Check for Sentry in different environments
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      return true;
    }
    
    // React Native environment - check global Sentry
    if (typeof global !== 'undefined' && (global as any).Sentry) {
      return true;
    }
    
    return false;
  }

  /**
   * Add an error reporting provider
   */
  addProvider(provider: ErrorReportingProvider): void {
    this.providers.push(provider);
  }

  /**
   * Report an error
   */
  async reportError(
    error: Error | string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context: Partial<ErrorContext> = {},
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.config.enabled) return;

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      severity,
      category,
      context: {
        timestamp: Date.now(),
        ...context
      },
      metadata,
      tags: this.generateTags(severity, category)
    };

    // Add to queue
    this.errorQueue.push(errorReport);

    // Flush if queue is full
    if (this.errorQueue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Flush all queued errors
   */
  async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToFlush = this.errorQueue.splice(0, this.config.batchSize);
    
    // Report to all enabled providers
    const promises = this.providers
      .filter(provider => provider.enabled)
      .map(provider => 
        Promise.allSettled(
          errorsToFlush.map(error => provider.report(error))
        )
      );

    await Promise.allSettled(promises);
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Generate a unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate tags for error categorization
   */
  private generateTags(severity: ErrorSeverity, category: ErrorCategory): string[] {
    return [severity, category, 'mobile-app'];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current error queue size
   */
  getQueueSize(): number {
    return this.errorQueue.length;
  }

  /**
   * Clear error queue
   */
  clearQueue(): void {
    this.errorQueue = [];
  }
}

/**
 * Console Error Provider for development
 */
class ConsoleErrorProvider implements ErrorReportingProvider {
  name = 'console';
  enabled = true;

  async report(error: ErrorReport): Promise<void> {
    // console.group(`🚨 Error Report: ${error.id}`);
    // console.error('Message:', error.message);
    // console.error('Severity:', error.severity);
    // console.error('Category:', error.category);
    // console.error('Context:', error.context);
    // if (error.stack) console.error('Stack:', error.stack);
    if (error.metadata) console.error('Metadata:', error.metadata);
    console.groupEnd();
  }

  async flush(): Promise<void> {
    // No-op for console provider
  }
}

/**
 * Sentry Error Provider (React Native compatible)
 */
class SentryErrorProvider implements ErrorReportingProvider {
  name = 'sentry';
  enabled = true;

  async report(error: ErrorReport): Promise<void> {
    const Sentry = this.getSentry();
    if (Sentry) {
      Sentry.withScope((scope: any) => {
        scope.setTag('category', error.category);
        scope.setTag('severity', error.severity);
        scope.setContext('errorContext', error.context);
        scope.setLevel(error.severity as any);
        
        if (error.metadata) {
          scope.setContext('metadata', error.metadata);
        }

        Sentry.captureException(new Error(error.message));
      });
    }
  }

  async flush(): Promise<void> {
    const Sentry = this.getSentry();
    if (Sentry && typeof Sentry.flush === 'function') {
      await Sentry.flush();
    }
  }

  /**
   * Get Sentry instance (React Native compatible)
   * @returns Sentry instance or null
   */
  private getSentry(): any {
    // Browser environment
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      return (window as any).Sentry;
    }
    
    // React Native environment
    if (typeof global !== 'undefined' && (global as any).Sentry) {
      return (global as any).Sentry;
    }
    
    return null;
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService();
export default errorReportingService;
