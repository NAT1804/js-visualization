import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { addEntity, updateEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, finalize, pipe, switchMap, takeWhile, tap, timer } from 'rxjs';
import { EVENT_TYPE } from '../models/app.enum';
import { WorkerEvent } from '../models/app.model';
import { PromiseVisualizerState, withPromiseVisualizer } from './promise.store';
import { withWorkerStore } from './worker.store';

export interface IVisualizer {
  playbackSpeed: number;
  isPlayingVisualizer: boolean;
  currentHighlightBlock: string;
}

const initialState: IVisualizer = {
  playbackSpeed: 1000,
  isPlayingVisualizer: false,
  currentHighlightBlock: '',
};

export const VisualizerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withWorkerStore(),
  withPromiseVisualizer(),
  withMethods((store) => {
    const processEvent = (event: WorkerEvent) => {
      console.log('processEvent', event);
      const selectedPromise = store.selectedPromise();
      switch (event.type) {
        case EVENT_TYPE.PROMISE_CREATED:
          const newPromise: PromiseVisualizerState = {
            id: event.payload.id,
            promiseState: event.payload.state,
            promiseResult: event.payload.result ?? 'undefined',
            fulfilledReactions: [],
            rejectedReactions: [],
            finallyReactions: null,
            isHandlers: false,
            isShaking: false,
          };
          patchState(store, addEntity(newPromise, { collection: 'promises' }));
          break;
        case EVENT_TYPE.PROMISE_UPDATE:
          patchState(
            store,
            updateEntity(
              {
                id: event.payload.id,
                changes: {
                  promiseState: event.payload.state,
                  promiseResult: event.payload.result,
                  isShaking: true,
                  isHandlers: true,
                },
              },
              { collection: 'promises' },
            ),
          );
          break;
        case EVENT_TYPE.PROMISE_REACTION_ADDED_RESOLVED:
          store.selectPromise(event.payload.id);
          if (event.payload.fulfilledHandler) {
            patchState(
              store,
              updateEntity(
                {
                  id: event.payload.id,
                  changes: {
                    fulfilledReactions: [
                      ...(selectedPromise?.fulfilledReactions || []),
                      event.payload.fulfilledHandler,
                    ],
                    isHandlers: true,
                  },
                },
                { collection: 'promises' },
              ),
            );
          }
          break;
        case EVENT_TYPE.PROMISE_REACTION_ADDED_REJECTED:
          store.selectPromise(event.payload.id);
          if (event.payload.rejectedHandler) {
            patchState(
              store,
              updateEntity(
                {
                  id: event.payload.id,
                  changes: {
                    rejectedReactions: [
                      ...(selectedPromise?.rejectedReactions || []),
                      event.payload.rejectedHandler,
                    ],
                    isHandlers: true,
                  },
                },
                { collection: 'promises' },
              ),
            );
          }
          break;
        case EVENT_TYPE.PROMISE_REACTION_ADDED_FINALLY:
          store.selectPromise(event.payload.id);
          if (event.payload.finallyHandler) {
            patchState(
              store,
              updateEntity(
                {
                  id: event.payload.id,
                  changes: {
                    finallyReactions: [
                      ...(selectedPromise?.finallyReactions || []),
                      event.payload.finallyHandler,
                    ],
                  },
                },
                { collection: 'promises' },
              ),
            );
          }
          break;
      }
    };

    return {
      playVisualizer: rxMethod<void>(
        pipe(
          tap(() => {
            store.resetPromiseVisualizer();
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
      resetStore() {
        store.resetWorkerEvents();
        store.resetPromiseVisualizer();
        patchState(store, {
          ...initialState,
        });
      },
    };
  }),
);

export function setIsPlayingVisualizer(isPlayingVisualizer: boolean) {
  return { isPlayingVisualizer };
}

export function setCurrentHighlightBlock(currentHighlightBlock: string) {
  return { currentHighlightBlock };
}
