export interface Logger {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, any>): void {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
}

export const logger = new ConsoleLogger();