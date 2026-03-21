import { patchState, signalStoreFeature, type, withMethods, withState } from '@ngrx/signals';
import { PROMISE_STATE } from '../models/app.enum';
import { addEntity, removeAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { withSelectedPromise } from './with-selected-promise';

export interface PromiseVisualizerState {
  id: string;
  promiseState: PROMISE_STATE;
  promiseResult: any;
  fulfilledReactions: any[];
  rejectedReactions: any[];
  finallyReactions: any;
  isHandlers: boolean;
  isShaking: boolean;
}

export function withPromiseVisualizer() {
  return signalStoreFeature(
    withEntities({
      entity: type<PromiseVisualizerState>(),
      collection: 'promises',
    }),
    withSelectedPromise(),
    withMethods((store) => ({
      resetPromiseVisualizer() {
        patchState(store, removeAllEntities({ collection: 'promises' }));
      },
      addPromise(promise: PromiseVisualizerState) {
        patchState(store, addEntity(promise, { collection: 'promises' }));
      },
      updatePromise(id: string, changes: Partial<PromiseVisualizerState>) {
        patchState(store, updateEntity({ id, changes }, { collection: 'promises' }));
      },
    })),
  );
}
