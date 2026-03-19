import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { PROMISE_STATE } from '../models/app.enum';
import { computed } from '@angular/core';

export interface PromiseVisualizerState {
  promiseState: PROMISE_STATE;
  promiseResult: any;
  fulfilledReactions: any[];
  rejectedReactions: any[];
  isHandlers: boolean;
}

const initialState: PromiseVisualizerState = {
  promiseState: PROMISE_STATE.IDLE,
  promiseResult: undefined,
  fulfilledReactions: [],
  rejectedReactions: [],
  isHandlers: false,
};

export function withPromiseVisualizer() {
  return signalStoreFeature(
    withState(initialState),
    withMethods((store) => ({
      resetPromiseStore() {
        patchState(store, initialState);
      },
    })),
  );
}

export function setPromiseState(state: PROMISE_STATE) {
  return { promiseState: state };
}

export function setPromiseResult(result: any) {
  return { promiseResult: result };
}

export function addFulfilledReaction(fulfilledReactions: any) {
  return { fulfilledReactions };
}

export function addRejectedReaction(rejectedReactions: any) {
  return { rejectedReactions };
}

export function setIsHandlers(isHandlers: boolean) {
  return { isHandlers };
}
