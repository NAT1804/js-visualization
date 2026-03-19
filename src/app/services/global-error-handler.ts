import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logging = inject(LoggingService);

  handleError(error: unknown): void {
    this.logging.logError('[GlobalErrorHandler] Caught error', error);
  }
}
