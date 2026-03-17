import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface WorkerEvent {
  type: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root',
})
export class EventLoopSimulationService {
  private worker: Worker | null = null;
  private eventSubject = new Subject<WorkerEvent>();
  private timeoutId: any;

  public workerEvents$: Observable<WorkerEvent> = this.eventSubject.asObservable();

  executeCode(userCode: string, timeoutMs: number = 3000): void {
    this.terminateWorker();

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./executor.worker', import.meta.url), { type: 'module' });

      this.worker.onmessage = ({ data }) => {
        this.eventSubject.next(data);
      };

      this.worker.onerror = (error) => {
        this.eventSubject.next({ type: 'ERROR', payload: error.message });
        this.terminateWorker();
      };

      this.worker.postMessage(userCode);

      this.timeoutId = setTimeout(() => {
        this.eventSubject.next({
          type: 'TIMEOUT_ERROR',
          payload: 'Quá thời gian thực thi (Infinite Loop phát hiện).',
        });
        this.terminateWorker();
      }, timeoutMs);
    } else {
      this.eventSubject.next({ type: 'ERROR', payload: 'Trình duyệt không hỗ trợ Web Workers.' });
    }
  }

  terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
