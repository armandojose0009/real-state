export interface Logger {
  context: string;
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
}

export function createLogger(context: string): Logger {
  return {
    context,
    error: (message: string) => logError(message, context),
    info: (message: string) => logInfo(message, context),
    warn: (message: string) => logWarn(message, context),
    debug: (message: string) => logDebug(message, context),
  };
}

export function logError(message: string, context?: string): void {
  const prefix = context ? `[${context}] ERROR:` : 'ERROR:';
  console.error(`${prefix} ${message}`);
}

export function logInfo(message: string, context?: string): void {
  const prefix = context ? `[${context}] INFO:` : 'INFO:';
  console.log(`${prefix} ${message}`);
}

export function logWarn(message: string, context?: string): void {
  const prefix = context ? `[${context}] WARN:` : 'WARN:';
  console.warn(`${prefix} ${message}`);
}

export function logDebug(message: string, context?: string): void {
  const prefix = context ? `[${context}] DEBUG:` : 'DEBUG:';
  console.debug(`${prefix} ${message}`);
}