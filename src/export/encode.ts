import { FEATURES, WATERMARK_TEXT } from "../config";

export function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("JPEG encoding failed"))), "image/jpeg", quality),
  );
}

export interface FittedJpeg {
  blob: Blob;
  quality: number;
  /** False when even the lowest quality is still over the limit. */
  fits: boolean;
}

const MIN_QUALITY = 0.3;
const MAX_QUALITY = 0.95;

/** Highest JPEG quality whose file is at most maxKb (binary search). */
export async function jpegUnderSize(canvas: HTMLCanvasElement, maxKb: number): Promise<FittedJpeg> {
  const limit = maxKb * 1024;
  const best = await toJpeg(canvas, MAX_QUALITY);
  if (best.size <= limit) return { blob: best, quality: MAX_QUALITY, fits: true };

  let lo = MIN_QUALITY, hi = MAX_QUALITY;
  let fit: FittedJpeg | null = null;
  const floor = await toJpeg(canvas, lo);
  if (floor.size > limit) return { blob: floor, quality: lo, fits: false };
  fit = { blob: floor, quality: lo, fits: true };
  for (let i = 0; i < 7; i++) {
    const q = (lo + hi) / 2;
    const b = await toJpeg(canvas, q);
    if (b.size <= limit) {
      fit = { blob: b, quality: q, fits: true };
      lo = q;
    } else {
      hi = q;
    }
  }
  return fit;
}

/** Returns a watermarked copy when the feature flag is on, otherwise the canvas itself. */
export function maybeWatermark(canvas: HTMLCanvasElement): HTMLCanvasElement {
  if (!FEATURES.watermarkOnFreeDownloads) return canvas;
  const c = document.createElement("canvas");
  c.width = canvas.width;
  c.height = canvas.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0);
  ctx.font = `${Math.round(c.width / 18)}px sans-serif`;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.textAlign = "center";
  ctx.fillText(WATERMARK_TEXT, c.width / 2, c.height - c.width / 20);
  return c;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
