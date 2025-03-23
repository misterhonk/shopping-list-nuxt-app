/**
 * Simple logger utility for the application
 * Supports different log levels and module identification
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Configuration for the logger
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
};

// Current configuration (can be updated at runtime)
let currentConfig = { ...defaultConfig };

/**
 * Configure the global logger behavior
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Logger interface defining available methods
 */
export interface Logger {
  debug: (message: string, ...data: unknown[]) => void;
  info: (message: string, ...data: unknown[]) => void;
  warn: (message: string, ...data: unknown[]) => void;
  error: (message: string, ...data: unknown[]) => void;
}

/**
 * Creates a logger for a specific module
 *
 * @param module The name of the module using the logger
 * @returns A logger instance
 */
export function createLogger(module: string): Logger {
  return {
    debug(message: string, ...data: unknown[]): void {
      log(LogLevel.DEBUG, module, message, data);
    },
    info(message: string, ...data: unknown[]): void {
      log(LogLevel.INFO, module, message, data);
    },
    warn(message: string, ...data: unknown[]): void {
      log(LogLevel.WARN, module, message, data);
    },
    error(message: string, ...data: unknown[]): void {
      log(LogLevel.ERROR, module, message, data);
    },
  };
}

/**
 * Internal log function
 */
function log(level: LogLevel, module: string, message: string, data: unknown[]): void {
  // Check if we should log based on minimum level
  const levels = Object.values(LogLevel);
  if (levels.indexOf(level) < levels.indexOf(currentConfig.minLevel)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;

  // Console logging (browser environment)
  if (currentConfig.enableConsole) {
    switch (level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, ...data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...data);
        break;
    }
  }

  // Additional logging destinations could be added here
  // e.g., remote logging service, file logging, etc.
}
