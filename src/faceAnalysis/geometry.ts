import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { sampleMask, type PersonMask } from "../segmentation/segment";

// Face-mesh landmark indices (478-point model with irises).
const IRIS_A = 468;
const IRIS_B = 473;
const CHIN = 152;
const FOREHEAD_TOP = 10;

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Everything the cropper needs, in source-image pixels. */
export interface FaceGeometry {
  eyeMid: Point;
  /** Eye-line angle in radians (positive = head tilted clockwise in the image). */
  roll: number;
  /** Distance from the eye line up to the top of the hair, perpendicular to the eye line. */
  crownAbove: number;
  /** Distance from the eye line down to the chin. */
  chinBelow: number;
  faceBox: Box;
  /** True when the hair reaches the top edge, i.e. the top of the head is cut off. */
  headCutOff: boolean;
}

export interface FaceDetection {
  faces: NormalizedLandmark[][];
}

export function detectFaces(landmarker: FaceLandmarker, image: HTMLCanvasElement | HTMLVideoElement, timestamp?: number): FaceDetection {
  const res = timestamp === undefined ? landmarker.detect(image) : landmarker.detectForVideo(image, timestamp);
  return { faces: res.faceLandmarks };
}

export function faceBox(lm: NormalizedLandmark[], w: number, h: number): Box {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of lm) {
    x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
  }
  return { x: x0 * w, y: y0 * h, width: (x1 - x0) * w, height: (y1 - y0) * h };
}

/** Pick the largest face, the one the user most likely means. */
export function primaryFace(faces: NormalizedLandmark[][], w: number, h: number): NormalizedLandmark[] | undefined {
  let best: NormalizedLandmark[] | undefined;
  let bestArea = 0;
  for (const f of faces) {
    const b = faceBox(f, w, h);
    if (b.width * b.height > bestArea) {
      bestArea = b.width * b.height;
      best = f;
    }
  }
  return best;
}

export function rollOf(lm: NormalizedLandmark[], w: number, h: number): number {
  const a = lm[IRIS_A], b = lm[IRIS_B];
  // Order the eyes left→right in the image so the angle is independent of mirroring.
  const [l, r] = a.x <= b.x ? [a, b] : [b, a];
  return Math.atan2((r.y - l.y) * h, (r.x - l.x) * w);
}

export function measureFace(lm: NormalizedLandmark[], w: number, h: number, mask: PersonMask | null): FaceGeometry {
  const px = (p: NormalizedLandmark): Point => ({ x: p.x * w, y: p.y * h });
  const a = px(lm[IRIS_A]), b = px(lm[IRIS_B]);
  const eyeMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const roll = rollOf(lm, w, h);
  const along = { x: Math.cos(roll), y: Math.sin(roll) };
  const up = { x: Math.sin(roll), y: -Math.cos(roll) };
  const dotUp = (p: Point) => (p.x - eyeMid.x) * up.x + (p.y - eyeMid.y) * up.y;

  const chinBelow = -dotUp(px(lm[CHIN]));
  const foreheadAbove = dotUp(px(lm[FOREHEAD_TOP]));
  const faceLen = foreheadAbove + chinBelow;
  const eyeDist = Math.hypot(b.x - a.x, b.y - a.y);

  // The mesh stops near the hairline; walk up through the person mask to find the top of the hair.
  let crownAbove = foreheadAbove + 0.22 * faceLen;
  let headCutOff = false;
  if (mask) {
    const step = Math.max(1, faceLen / 200);
    const lateral = [-0.5, -0.25, 0, 0.25, 0.5].map((k) => k * eyeDist);
    let last = foreheadAbove;
    let gap = 0;
    for (let t = foreheadAbove; t < foreheadAbove + faceLen; t += step) {
      let fg = false;
      for (const k of lateral) {
        const x = eyeMid.x + up.x * t + along.x * k;
        const y = eyeMid.y + up.y * t + along.y * k;
        if (y < 0) {
          headCutOff = true;
          break;
        }
        if (sampleMask(mask, x / w, y / h) > 0.5) fg = true;
      }
      if (headCutOff) {
        last = t;
        break;
      }
      if (fg) {
        last = t;
        gap = 0;
      } else if (++gap * step > 0.05 * faceLen) {
        break;
      }
    }
    crownAbove = Math.max(last, foreheadAbove);
  }

  return { eyeMid, roll, crownAbove, chinBelow, faceBox: faceBox(lm, w, h), headCutOff };
}
