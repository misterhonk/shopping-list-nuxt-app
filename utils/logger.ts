/**
 * Simple logger utility for the application
 * Supports different log levels and module identification
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = '_error',
}

// Configuration for the logger
export interface ILoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
}

// Default configuration
const defaultConfig: ILoggerConfig = {
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
};

// Current configuration (can be updated at runtime)
let _currentConfig = { ...defaultConfig };

/**
 * Configure the global logger behavior
 */
export function configureLogger(config: Partial<ILoggerConfig>): void {
  _currentConfig = { ...currentConfig, ...config };
}

/**
 * ILogger interface defining available methods
 */
export interface ILogger {
  debug: (message: string, ..._data: unknown[]) => void;
  info: (message: string, ..._data: unknown[]) => void;
  warn: (message: string, ..._data: unknown[]) => void;
  error: (message: string, ..._data: unknown[]) => void;
}

/**
 * Creates a logger for a specific module
 *
 * @param module The name of the module using the logger
 * @returns A logger instance
 */
export function createLogger(module: string): ILogger {
  return {
    debug(message: string, ..._data: unknown[]): void {
      log(LogLevel.DEBUG, module, message, _data);
    },
    info(message: string, ..._data: unknown[]): void {
      log(LogLevel.INFO, module, message, _data);
    },
    warn(message: string, ..._data: unknown[]): void {
      log(LogLevel.WARN, module, message, _data);
    },
    error(message: string, ..._data: unknown[]): void {
      log(LogLevel.ERROR, module, message, _data);
    },
  };
}

/**
 * Internal log function
 */
function log(level: LogLevel, module: string, message: string, _data: unknown[]): void {
  // Check if we should log based on minimum level
  const levels = Object.values(LogLevel);
  if (levels.indexOf(level) < levels.indexOf(_currentConfig.minLevel)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;

  // Console logging (browser environment)
  if (_currentConfig.enableConsole) {
    switch(level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, ..._data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ..._data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ..._data);
        break;
      case LogLevel.ERROR:
        console._error(formattedMessage, ..._data);
        break;
    }
  }

  // Additional logging destinations could be added here
  // e.g., remote logging service, file logging, etc.
}
