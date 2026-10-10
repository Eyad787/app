import type { ImageSegmenter } from "@mediapipe/tasks-vision";

/** Person-probability mask at the segmenter's output resolution. */
export interface PersonMask {
  width: number;
  height: number;
  /** 0..1 confidence that each pixel belongs to the person. */
  data: Float32Array;
}

export function segmentPerson(segmenter: ImageSegmenter, image: HTMLCanvasElement): PersonMask {
  const result = segmenter.segment(image);
  try {
    const mask = result.confidenceMasks?.[0];
    if (!mask) throw new Error("Segmenter returned no mask");
    // Copy out: the underlying buffer is freed with the result.
    return { width: mask.width, height: mask.height, data: new Float32Array(mask.getAsFloat32Array()) };
  } finally {
    result.close();
  }
}

/** Mask value at a normalized point (0..1), or 0 outside the image. */
export function sampleMask(mask: PersonMask, nx: number, ny: number): number {
  const x = Math.round(nx * (mask.width - 1));
  const y = Math.round(ny * (mask.height - 1));
  if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) return 0;
  return mask.data[y * mask.width + x];
}

/**
 * Grayscale canvas of the mask with the soft edge tightened slightly:
 * confidences below `lo` become 0, above `hi` become 1, smooth in between.
 * Pulling the edge in a little keeps the old background from bleeding into hair.
 */
export function maskToCanvas(mask: PersonMask, lo = 0.4, hi = 0.75): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = mask.width;
  canvas.height = mask.height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(mask.width, mask.height);
  for (let i = 0; i < mask.data.length; i++) {
    const t = Math.min(1, Math.max(0, (mask.data[i] - lo) / (hi - lo)));
    const v = Math.round(t * t * (3 - 2 * t) * 255);
    const j = i * 4;
    img.data[j] = img.data[j + 1] = img.data[j + 2] = v;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
