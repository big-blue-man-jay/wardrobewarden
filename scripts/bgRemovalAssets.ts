import { createReadStream, existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Serves (dev) and copies (build) the background-removal model + ONNX runtime files from
 * node_modules/@imgly/background-removal-data into `<base>/bg-removal/`, so the app never
 * downloads them from a third-party CDN. Only the files the app can use are copied.
 */
const DATA_DIR = resolve('node_modules/@imgly/background-removal-data/dist');

interface Resource {
  chunks: { hash: string; offsets: [number, number] }[];
  size: number;
  mime: string;
}

export function bgRemovalAssets({ dir = 'bg-removal', model = 'small' } = {}): Plugin {
  const keys = [
    `/models/${model}`,
    '/onnxruntime-web/ort-wasm.wasm',
    '/onnxruntime-web/ort-wasm-simd.wasm',
    '/onnxruntime-web/ort-wasm-threaded.wasm',
    '/onnxruntime-web/ort-wasm-simd-threaded.wasm',
  ];

  const loadResources = async () => {
    const all = JSON.parse(await readFile(join(DATA_DIR, 'resources.json'), 'utf8')) as Record<string, Resource>;
    const picked: Record<string, Resource> = {};
    for (const k of keys) {
      if (!all[k]) throw new Error(`[bg-removal] ${k} missing from @imgly/background-removal-data`);
      picked[k] = all[k];
    }
    return picked;
  };

  let outDir = 'dist';
  return {
    name: 'bg-removal-assets',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use(`/${dir}/`, async (req, res, next) => {
        const name = (req.url ?? '').split('?')[0].replace(/^\//, '');
        if (name === 'resources.json') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(await loadResources()));
          return;
        }
        const file = join(DATA_DIR, name);
        if (!/^[a-f0-9]{64}$/.test(name) || !existsSync(file)) return next();
        res.setHeader('Content-Type', 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    async writeBundle() {
      const resources = await loadResources();
      const target = resolve(outDir, dir);
      await mkdir(target, { recursive: true });
      await writeFile(join(target, 'resources.json'), JSON.stringify(resources));
      const hashes = new Set(Object.values(resources).flatMap((r) => r.chunks.map((c) => c.hash)));
      await Promise.all([...hashes].map((h) => copyFile(join(DATA_DIR, h), join(target, h))));
      const mb = Object.values(resources).reduce((s, r) => s + r.size, 0) / 1e6;
      console.log(`[bg-removal] copied ${hashes.size} files (${mb.toFixed(0)} MB) to ${dir}/`);
    },
  };
}
