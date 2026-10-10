import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { faceBox, rollOf, type Box } from "./geometry";

export type IssueCode = "noFace" | "multipleFaces" | "tilted" | "tooSmall" | "tooLarge" | "tooDark" | "tooBright" | "blurry" | "headCutOff" | "lowResolution";

export interface Issue {
  code: IssueCode;
  /** Blocking issues stop processing; warnings are shown but don't block. */
  blocking: boolean;
}

export const MAX_ROLL_DEG = 5;

/** Mean luma (0..255) and Laplacian variance of a region, measured on a small copy. */
export function measureRegion(source: CanvasImageSource, box: Box): { brightness: number; sharpness: number } {
  const size = 128;
  const scale = size / Math.max(box.width, box.height, 1);
  const w = Math.max(8, Math.round(box.width * scale));
  const h = Math.max(8, Math.round(box.height * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, box.x, box.y, box.width, box.height, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0; i < w * h; i++) {
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
    sum += gray[i];
  }
  let lsum = 0, lsq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w] - 4 * gray[i];
      lsum += lap;
      lsq += lap * lap;
      n++;
    }
  }
  const mean = lsum / Math.max(n, 1);
  return { brightness: sum / (w * h), sharpness: lsq / Math.max(n, 1) - mean * mean };
}

interface CheckOptions {
  /** Live camera framing: the face should sit inside the oval guide. */
  framing: boolean;
}

export function checkFrame(
  faces: NormalizedLandmark[][],
  face: NormalizedLandmark[] | undefined,
  source: CanvasImageSource,
  w: number,
  h: number,
  { framing }: CheckOptions,
): Issue[] {
  if (!face || faces.length === 0) return [{ code: "noFace", blocking: true }];
  const issues: Issue[] = [];
  if (faces.length > 1) issues.push({ code: "multipleFaces", blocking: framing });

  const rollDeg = Math.abs((rollOf(face, w, h) * 180) / Math.PI);
  // Uploaded photos are straightened automatically, so tilt only matters live.
  if (framing && rollDeg > MAX_ROLL_DEG) issues.push({ code: "tilted", blocking: false });

  const box = faceBox(face, w, h);
  if (framing) {
    const rel = box.height / h;
    if (rel < 0.25) issues.push({ code: "tooSmall", blocking: false });
    else if (rel > 0.7) issues.push({ code: "tooLarge", blocking: false });
  }

  const { brightness, sharpness } = measureRegion(source, box);
  if (brightness < 70) issues.push({ code: "tooDark", blocking: false });
  else if (brightness > 220) issues.push({ code: "tooBright", blocking: false });
  if (sharpness < 25) issues.push({ code: "blurry", blocking: false });
  return issues;
}
