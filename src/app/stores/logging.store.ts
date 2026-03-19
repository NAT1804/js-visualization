import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntity, removeAllEntities, withEntities } from '@ngrx/signals/entities';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: unknown;
}

export const LoggingStore = signalStore(
  { providedIn: 'root' },
  withEntities<LogEntry>(),
  withMethods((store) => ({
    add(entry: LogEntry) {
      patchState(store, addEntity(entry))
    },
    clear() {
      patchState(store, removeAllEntities());
    },
  })),
);

