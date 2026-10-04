import { IMAGE_MAX_EDGE, IMAGE_QUALITY, THUMB_MAX_EDGE } from '../config/app';

type Drawable = ImageBitmap | HTMLImageElement;

/** Decode an image file/blob, respecting EXIF orientation (phone photos). */
export async function decodeImage(blob: Blob): Promise<Drawable> {
  if ('createImageBitmap' in window && blob.type !== 'image/svg+xml') {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      // fall through to <img> (e.g. older Safari)
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sizeOf(img: Drawable): { w: number; h: number } {
  return img instanceof HTMLImageElement
    ? { w: img.naturalWidth || 600, h: img.naturalHeight || 600 }
    : { w: img.width, h: img.height };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), type, quality),
  );
}

/**
 * Scale an image down so its long edge is at most `maxEdge`.
 * Use `transparent: true` for cutouts (keeps the alpha channel: WebP, or PNG where WebP encoding isn't supported).
 */
export async function resizeImage(
  source: Blob | Drawable,
  maxEdge: number,
  { transparent = false, quality = IMAGE_QUALITY } = {},
): Promise<Blob> {
  const img = source instanceof Blob ? await decodeImage(source) : source;
  const { w, h } = sizeOf(img);
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (transparent) {
    const webp = await canvasToBlob(canvas, 'image/webp', quality);
    return webp.type === 'image/webp' ? webp : canvasToBlob(canvas, 'image/png', 1);
  }
  return canvasToBlob(canvas, 'image/jpeg', quality);
}

/** A newly picked photo, resized for storage, plus its grid thumbnail. */
export async function preparePhoto(file: Blob): Promise<{ photo: Blob; thumbnail: Blob }> {
  const img = await decodeImage(file);
  const [photo, thumbnail] = await Promise.all([resizeImage(img, IMAGE_MAX_EDGE), resizeImage(img, THUMB_MAX_EDGE)]);
  if ('close' in img) img.close();
  return { photo, thumbnail };
}

/** Thumbnail for an already-stored photo or cutout. */
export function makeThumbnail(blob: Blob, transparent: boolean): Promise<Blob> {
  return resizeImage(blob, THUMB_MAX_EDGE, { transparent });
}

/**
 * Crops away fully transparent margins (plus a little padding), so cutouts fill their tile.
 * Throws if the image is (almost) entirely transparent — i.e. the cutout found nothing.
 */
export async function trimTransparent(blob: Blob, padding = 0.04): Promise<Blob> {
  const img = await decodeImage(blob);
  const { w, h } = sizeOf(img);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1,
    opaque = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 24) {
        opaque++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (opaque < w * h * 0.01) throw new Error('Cutout is empty');
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * padding);
  const x0 = Math.max(0, minX - pad);
  const y0 = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad + 1) - x0;
  const ch = Math.min(h, maxY + pad + 1) - y0;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  out.getContext('2d')!.drawImage(canvas, x0, y0, cw, ch, 0, 0, cw, ch);
  return canvasToBlob(out, 'image/png', 1);
}
