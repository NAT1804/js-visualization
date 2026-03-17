import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoggingService } from './logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logging = inject(LoggingService);
  private readonly snackBar = inject(MatSnackBar);

  handleError(error: unknown): void {
    this.logging.logError('[GlobalErrorHandler] Caught error', error);

    this.snackBar.open('An unexpected error occurred', 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
