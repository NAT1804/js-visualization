import { CONSOLE_LOG, ERROR, MACROTASK_EXECUTED, MACROTASK_QUEUED } from '../constants/constants';

const originalSetTimeout = self.setTimeout;
const originalConsoleLog = self.console.log;

self.setTimeout = (callback: TimerHandler, delay?: number) => {
  self.postMessage({ type: MACROTASK_QUEUED });

  return originalSetTimeout(() => {
    self.postMessage({ type: MACROTASK_EXECUTED });
    if (typeof callback === 'function') {
      callback();
    }
  }, delay);
};

self.console.log = (...args: any[]) => {
  self.postMessage({ type: CONSOLE_LOG, payload: args });
  originalConsoleLog(...args);
};

self.addEventListener('message', (event) => {
  const userCode = event.data;

  try {
    const execute = new Function(userCode);
    execute();
  } catch (error) {
    self.postMessage({ type: ERROR, payload: error });
  }
});
