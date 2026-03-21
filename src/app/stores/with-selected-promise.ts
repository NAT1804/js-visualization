import { computed } from '@angular/core';
import {
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
  patchState,
} from '@ngrx/signals';
import { EntityMap } from '@ngrx/signals/entities';
import { PromiseVisualizerState } from './promise.store';

export function withSelectedPromise() {
  return signalStoreFeature(
    withState({
      selectedPromiseId: null as string | null,
    }),
    withComputed((store: any) => ({
      selectedPromise: computed(() => {
        const id = store.selectedPromiseId();
        const entities = store.promisesEntityMap() as EntityMap<PromiseVisualizerState>;
        return id ? entities[id] : null;
      }),
    })),
    withMethods((store) => ({
      selectPromise(id: string): void {
        patchState(store, { selectedPromiseId: id });
      },
      clearSelectedPromise(): void {
        patchState(store, { selectedPromiseId: null });
      },
    })),
  );
}
