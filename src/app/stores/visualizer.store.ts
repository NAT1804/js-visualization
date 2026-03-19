import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { EVENT_TYPE } from '../models/app.enum';
import { WorkerEvent } from '../models/app.model';
import {
  addFulfilledReaction,
  addRejectedReaction,
  setIsHandlers,
  setPromiseResult,
  setPromiseState,
  withPromiseVisualizer,
} from './promise.store';
import { setWorkerEvents, withWorkerStore } from './worker.store';
import { filter, finalize, interval, pipe, switchMap, takeWhile, tap, timer } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

export interface IVisualizer {
  playbackSpeed: number;
  isPlayingVisualizer: boolean;
}

const initialState: IVisualizer = {
  playbackSpeed: 3000,
  isPlayingVisualizer: false,
};

export const VisualizerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withWorkerStore(),
  withPromiseVisualizer(),
  withMethods((store) => {
    const processEvent = (event: WorkerEvent) => {
      console.log('processEvent', event);
      switch (event.type) {
        case EVENT_TYPE.PROMISE_CREATED:
          patchState(store, setPromiseState(event.payload.state));
          patchState(store, setPromiseResult(event.payload.result));
          break;
        case EVENT_TYPE.PROMISE_UPDATE:
          patchState(store, setPromiseState(event.payload.state));
          patchState(store, setPromiseResult(event.payload.result));
          patchState(store, setIsHandlers(true));
          break;
        case EVENT_TYPE.PROMISE_REACTION_ADDED_RESOLVED:
          if (event.payload.fulfilledHandler) {
            const fulfilledReactions = [
              ...store.fulfilledReactions(),
              event.payload.fulfilledHandler,
            ];
            patchState(store, addFulfilledReaction(fulfilledReactions));
            patchState(store, setIsHandlers(true));
          }
          if (event.payload.rejectedHandler) {
            const rejectedReactions = [...store.rejectedReactions(), event.payload.rejectedHandler];
            patchState(store, addRejectedReaction(rejectedReactions));
            patchState(store, setIsHandlers(true));
          }
          break;
      }
    };

    return {
      playVisualizer: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, setIsPlayingVisualizer(true));
          }),
          filter(() => store.isPlayingVisualizer() && !store.isEmptyWorkerEvent()),
          switchMap(() => {
            const tempCurrentQueue = [...store.workerEvents()];
            return timer(0, store.playbackSpeed()).pipe(
              takeWhile(() => store.isPlayingVisualizer() && tempCurrentQueue.length > 0),
              tap(() => {
                const currentEvent = tempCurrentQueue[0];
                tempCurrentQueue.shift();
                processEvent(currentEvent);
              }),
              finalize(() => {
                patchState(store, setIsPlayingVisualizer(false));
              }),
            );
          }),
        ),
      ),
    };
  }),
);

export function setIsPlayingVisualizer(isPlayingVisualizer: boolean) {
  return { isPlayingVisualizer };
}
