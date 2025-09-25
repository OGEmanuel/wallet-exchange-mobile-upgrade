// utils/dev-logger.ts
/**
 * Development Logger
 * 
 * Provides enhanced logging capabilities for development with:
 * - Conditional logging based on environment
 * - Structured logging with context
 * - Performance timing
 * - Error tracking
 * - Log levels and filtering
 * 
 * @example
 * ```typescript
 * devLogger.log('User action', { userId: '123', action: 'login' });
 * devLogger.time('API call');
 * // ... API call
 * devLogger.timeEnd('API call');
 * ```
 */

const isDevelopment = __DEV__;

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: number;
  stack?: string;
}

class DevLogger {
  private currentLevel: LogLevel = LogLevel.DEBUG;
  private timers: Map<string, number> = new Map();
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  /**
   * Set the minimum log level
   * @param level - Minimum log level to display
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Log a debug message
   * @param message - Message to log
   * @param context - Additional context data
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   * @param message - Message to log
   * @param context - Additional context data
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   * @param message - Message to log
   * @param context - Additional context data
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   * @param message - Message to log
   * @param context - Additional context data
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log a message (alias for info)
   * @param message - Message to log
   * @param context - Additional context data
   */
  log(message: string, context?: LogContext): void;
  log(level: LogLevel, message: string, context?: LogContext): void;
  log(levelOrMessage: LogLevel | string, message?: string | LogContext, context?: LogContext): void {
    if (typeof levelOrMessage === 'string') {
      this.log(LogLevel.INFO, levelOrMessage, message as LogContext);
    } else {
      this.log(levelOrMessage, message as string, context);
    }
  }

  /**
   * Internal log method
   * @param level - Log level
   * @param message - Message to log
   * @param context - Additional context data
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!isDevelopment || level < this.currentLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined
    };

    this.addToHistory(logEntry);

    const prefix = this.getLogPrefix(level);
    const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}${contextStr}`);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}${contextStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}${contextStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}${contextStr}`);
        if (logEntry.stack) {
          console.error(logEntry.stack);
        }
        break;
    }
  }

  /**
   * Start a performance timer
   * @param label - Timer label
   */
  time(label: string): void {
    if (!isDevelopment) return;
    this.timers.set(label, Date.now());
  }

  /**
   * End a performance timer and log the duration
   * @param label - Timer label
   */
  timeEnd(label: string): void {
    if (!isDevelopment) return;
    
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.info(`Timer: ${label}`, { duration: `${duration}ms` });
      this.timers.delete(label);
    } else {
      this.warn(`Timer '${label}' was not started`);
    }
  }

  /**
   * Group related log messages
   * @param label - Group label
   * @param fn - Function to execute within the group
   */
  group(label: string, fn: () => void): void {
    if (!isDevelopment) {
      fn();
      return;
    }

    console.group(label);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Log a table of data
   * @param data - Data to display as table
   * @param columns - Column names (optional)
   */
  table(data: any[], columns?: string[]): void {
    if (!isDevelopment) return;
    
    if (columns) {
      console.table(data, columns);
    } else {
      console.table(data);
    }
  }

  /**
   * Get log history
   * @param level - Filter by log level (optional)
   * @returns Array of log entries
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export log history as JSON
   * @returns JSON string of log history
   */
  exportHistory(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Get log prefix based on level
   * @param level - Log level
   * @returns Formatted prefix
   */
  private getLogPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    return `[${timestamp}] [${levelNames[level]}]`;
  }

  /**
   * Add log entry to history
   * @param entry - Log entry to add
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // Keep history size manageable
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }
}

export const devLogger = new DevLogger();
export default devLogger;
