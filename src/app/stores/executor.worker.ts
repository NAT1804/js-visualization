import { ANONYMOUS_FUNCTION } from '../constants/constants';
import { generateRandomHexString } from '@helpers/generate-random-id';
import { EVENT_TYPE, PROMISE_STATE } from '../models/app.enum';

let pendingAsyncTasks = 0;
let isSyncCodeDone = false;

const originalSetTimeout = self.setTimeout;
const originalConsoleLog = self.console.log;

function checkAllTaskDone() {
  if (pendingAsyncTasks === 0 && isSyncCodeDone) {
    self.postMessage({ type: EVENT_TYPE.ALL_TASKS_DONE });
  }
}

self.setTimeout = (callback: TimerHandler, delay?: number) => {
  pendingAsyncTasks++;
  self.postMessage({ type: EVENT_TYPE.MACROTASK_QUEUED });

  return originalSetTimeout(() => {
    pendingAsyncTasks--;
    self.postMessage({ type: EVENT_TYPE.MACROTASK_EXECUTED });
    if (typeof callback === 'function') {
      callback();
    }
    checkAllTaskDone();
  }, delay);
};

self.console.log = (...args: any[]) => {
  self.postMessage({ type: EVENT_TYPE.CONSOLE_LOG, payload: args });
  originalConsoleLog(...args);
};

self.addEventListener('message', (event) => {
  const userCode = event.data;

  try {
    const execute = new Function(userCode);
    execute();
  } catch (error) {
    self.postMessage({ type: EVENT_TYPE.ERROR, payload: error });
  } finally {
    isSyncCodeDone = true;
    checkAllTaskDone();
  }
});

const OriginalPromise: typeof Promise<unknown> = self.Promise;

class MockPromise extends OriginalPromise {
  private _internalId: string;

  constructor(
    executor: (resolve: (value: unknown) => void, reject: (reason: unknown) => void) => void,
  ) {
    let patchedResolve;
    let patchedReject;
    const currentId = generateRandomHexString();

    super((resolve, reject) => {
      patchedResolve = (value: unknown) => {
        self.postMessage({
          type: EVENT_TYPE.PROMISE_UPDATE,
          payload: { id: currentId, state: PROMISE_STATE.FULFILLED, result: value },
        });
        resolve(value);
      };

      patchedReject = (reason: unknown) => {
        self.postMessage({
          type: EVENT_TYPE.PROMISE_UPDATE,
          payload: { id: currentId, state: PROMISE_STATE.REJECTED, result: reason },
        });
        reject(reason);
      };

      self.postMessage({
        type: EVENT_TYPE.PROMISE_CREATED,
        payload: { id: currentId, state: PROMISE_STATE.PENDING, result: undefined },
      });

      try {
        executor(patchedResolve, patchedReject);
      } catch (err) {
        patchedReject(err);
      }
    });

    this._internalId = currentId;
  }

  override then(onFulfilled?: ((value: any) => any) | null): Promise<any> {
    self.postMessage({
      type: EVENT_TYPE.PROMISE_REACTION_ADDED_RESOLVED,
      payload: {
        id: this._internalId,
        fulfilledHandler: onFulfilled
          ? {
              name: onFulfilled.name || ANONYMOUS_FUNCTION,
              handler: onFulfilled.toString(),
            }
          : undefined,
      },
    });

    return super.then(onFulfilled);
  }

  override catch(onRejected?: ((reason: any) => any) | null): Promise<any> {
    self.postMessage({
      type: EVENT_TYPE.PROMISE_REACTION_ADDED_REJECTED,
      payload: {
        id: this._internalId,
        rejectedHandler: onRejected
          ? {
              name: onRejected.name || ANONYMOUS_FUNCTION,
              handler: onRejected.toString(),
            }
          : undefined,
      },
    });

    return super.catch(onRejected);
  }

  override finally(onFinally?: (() => void) | null): Promise<any> {
    self.postMessage({
      type: EVENT_TYPE.PROMISE_REACTION_ADDED_FINALLY,
      payload: {
        id: this._internalId,
        finallyHandler: onFinally
          ? {
              name: onFinally.name || ANONYMOUS_FUNCTION,
              handler: onFinally.toString(),
            }
          : undefined,
      },
    });

    return super.finally(onFinally);
  }
}

self.Promise = MockPromise as any;
