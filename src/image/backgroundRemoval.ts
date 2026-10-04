import { BG_REMOVAL_MODEL, BG_REMOVAL_PATH, IMAGE_MAX_EDGE } from '../config/app';
import { setSetting } from '../db/settings';
import { makeThumbnail, resizeImage, trimTransparent } from './resize';

/**
 * Background removal behind a small interface, so the engine can be swapped later
 * (e.g. a server or a different model). The rest of the app only uses `removeBackground`.
 */

export interface RemovalProgress {
  /** 'download' = fetching the model (first use only), 'process' = running it. */
  stage: 'download' | 'process';
  /** 0..1 */
  fraction: number;
}

export interface BackgroundRemover {
  /** Returns a PNG/WebP with a transparent background. Throws on failure. */
  remove(image: Blob, onProgress?: (p: RemovalProgress) => void): Promise<Blob>;
  /** Download and cache the model ahead of time (for offline use). */
  preload(onProgress?: (p: RemovalProgress) => void): Promise<void>;
}

// ---- Worker protocol (shared with bgRemoval.worker.ts) ----

export interface WorkerRequest {
  id: number;
  kind: 'remove' | 'preload';
  image?: Blob;
  publicPath: string;
  model: typeof BG_REMOVAL_MODEL;
}
export type WorkerResponse =
  | { id: number; type: 'progress'; key: string; current: number; total: number }
  | { id: number; type: 'done'; blob?: Blob }
  | { id: number; type: 'error'; message: string };

// ---- @imgly/background-removal implementation (runs in a Web Worker) ----

class ImglyRemover implements BackgroundRemover {
  private worker?: Worker;
  private nextId = 1;

  private getWorker(): Worker {
    this.worker ??= new Worker(new URL('./bgRemoval.worker.ts', import.meta.url), { type: 'module' });
    return this.worker;
  }

  private run(kind: WorkerRequest['kind'], image: Blob | undefined, onProgress?: (p: RemovalProgress) => void) {
    const worker = this.getWorker();
    const id = this.nextId++;
    // Model chunks are fetched one after another; track overall download progress across them.
    const downloads = new Map<string, { current: number; total: number }>();
    return new Promise<Blob | undefined>((resolve, reject) => {
      const onMessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        if (msg.id !== id) return;
        if (msg.type === 'progress') {
          if (msg.key.startsWith('fetch:')) {
            downloads.set(msg.key, { current: msg.current, total: msg.total });
            const all = [...downloads.values()];
            const total = all.reduce((s, d) => s + d.total, 0);
            onProgress?.({ stage: 'download', fraction: total ? all.reduce((s, d) => s + d.current, 0) / total : 0 });
          } else {
            onProgress?.({ stage: 'process', fraction: msg.current / Math.max(1, msg.total) });
          }
          return;
        }
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        if (msg.type === 'done') resolve(msg.blob);
        else reject(new Error(msg.message));
      };
      const onError = (e: ErrorEvent) => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        // A crashed worker can't be reused.
        this.worker?.terminate();
        this.worker = undefined;
        reject(new Error(e.message || 'Background removal worker failed'));
      };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      const publicPath = new URL(BG_REMOVAL_PATH, document.baseURI).href;
      worker.postMessage({ id, kind, image, publicPath, model: BG_REMOVAL_MODEL } satisfies WorkerRequest);
    });
  }

  async remove(image: Blob, onProgress?: (p: RemovalProgress) => void): Promise<Blob> {
    const out = await this.run('remove', image, onProgress);
    if (!out) throw new Error('No image returned');
    return out;
  }

  async preload(onProgress?: (p: RemovalProgress) => void): Promise<void> {
    await this.run('preload', undefined, onProgress);
  }
}

let remover: BackgroundRemover | undefined;

/** The active background remover. Swap the implementation here. */
export function getRemover(): BackgroundRemover {
  remover ??= new ImglyRemover();
  return remover;
}

export interface Cutout {
  cutout: Blob;
  thumbnail: Blob;
}

/** Cut out the piece, trim the empty margins and make its transparent thumbnail. Throws on failure. */
export async function makeCutout(photo: Blob, onProgress?: (p: RemovalProgress) => void): Promise<Cutout> {
  const raw = await getRemover().remove(photo, onProgress);
  void setSetting('bgModelReady', true);
  const trimmed = await trimTransparent(raw);
  const cutout = await resizeImage(trimmed, IMAGE_MAX_EDGE, { transparent: true });
  const thumbnail = await makeThumbnail(cutout, true);
  return { cutout, thumbnail };
}
