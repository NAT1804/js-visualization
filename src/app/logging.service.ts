import { Injectable, inject } from '@angular/core';
import { LoggingStore, LogLevel } from './logging.store';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly store = inject(LoggingStore);

  log(level: LogLevel, message: string, error?: unknown): void {
    const timestamp = new Date().toISOString();

    this.store.add({ id: uuidv4(), timestamp, level, message, error });

    switch (level) {
      case 'error':
        console.error(`[${timestamp}] [ERROR] ${message}`, error);
        break;
      case 'warn':
        console.warn(`[${timestamp}] [WARN] ${message}`, error);
        break;
      default:
        console.log(`[${timestamp}] [INFO] ${message}`, error);
        break;
    }
  }

  logError(message: string, error?: unknown): void {
    this.log('error', message, error);
  }

  logWarn(message: string, error?: unknown): void {
    this.log('warn', message, error);
  }

  logInfo(message: string, error?: unknown): void {
    this.log('info', message, error);
  }
}

