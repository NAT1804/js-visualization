import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { WorkerEvent } from '../models/app.model';
import { EVENT_TYPE } from '../models/app.enum';
import { computed } from '@angular/core';

export interface IWorkerStore {
  worker: Worker | null;
  workerEvents: WorkerEvent[];
  isComputing: boolean;
  isExecuted: boolean;
}

const initialState: IWorkerStore = {
  worker: null,
  workerEvents: [],
  isComputing: false,
  isExecuted: false,
};

export function withWorkerStore() {
  return signalStoreFeature(
    withState(initialState),
    withComputed((store) => ({
      isEmptyWorkerEvent: computed(() => store.workerEvents().length === 0),
    })),
    withMethods((store) => ({
      resetWorkerEvents() {
        store.worker()?.terminate();
        patchState(store, initialState);
      },
      executeCode(userCode: string) {
        this.resetWorkerEvents();
        patchState(store, setIsComputing(true));
        const worker = new Worker(new URL('./executor.worker', import.meta.url), {
          type: 'module',
        });
        worker.onmessage = ({ data }) => {
          patchState(store, setWorkerEvents([...store.workerEvents(), data]));
          if (data.type === EVENT_TYPE.ALL_TASKS_DONE) {
            patchState(store, setIsExecuted(true));
            patchState(store, setIsComputing(false));
          }
        };
        worker.onerror = (error) => {
          patchState(
            store,
            setWorkerEvents([
              ...store.workerEvents(),
              { type: EVENT_TYPE.ERROR, payload: error.message },
            ]),
          );
        };
        patchState(store, setWorker(worker));
        worker.postMessage(userCode);
      },
    })),
  );
}

export function setWorkerEvents(workerEvents: WorkerEvent[]) {
  return { workerEvents };
}

export function setWorker(worker: Worker) {
  return { worker };
}

export function setIsExecuted(isExecuted: boolean) {
  return { isExecuted };
}

export function setIsComputing(isComputing: boolean) {
  return { isComputing };
}
