/// <reference lib="webworker" />
// Runs @imgly/background-removal off the main thread so the UI (and progress bar) stays smooth.
import type { WorkerRequest, WorkerResponse } from './backgroundRemoval';

const post = (msg: WorkerResponse) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, kind, image, publicPath, model } = e.data;
  try {
    const lib = await import('@imgly/background-removal');
    const config = {
      publicPath,
      model,
      proxyToWorker: false, // we're already in a worker
      output: { format: 'image/png' as const },
      progress: (key: string, current: number, total: number) => post({ id, type: 'progress', key, current, total }),
    };
    if (kind === 'preload') {
      await lib.preload(config);
      post({ id, type: 'done' });
    } else {
      const blob = await lib.removeBackground(image!, config);
      post({ id, type: 'done', blob });
    }
  } catch (err) {
    post({ id, type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
