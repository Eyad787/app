import type { FaceGeometry, Point } from "../faceAnalysis/geometry";
import { midpoint, type PhotoType } from "../photoTypes";

/** Manual tweaks from the editor, applied on top of the automatic crop. */
export interface Adjustments {
  /** Multiplier on the auto scale (1 = auto). */
  zoom: number;
  /** Shift as a fraction of output width / height. */
  offsetX: number;
  offsetY: number;
  /** Extra rotation in degrees on top of auto-straightening. */
  rotateDeg: number;
  /** -50..50, applied to the person only. */
  brightness: number;
}

export const DEFAULT_ADJUSTMENTS: Adjustments = { zoom: 1, offsetX: 0, offsetY: 0, rotateDeg: 0, brightness: 0 };

/** Source → output mapping: rotate about the eye midpoint, scale, then place it. */
export interface Layout {
  scale: number;
  rotation: number;
  eyeOut: Point;
}

/** Minimum gap between the top of the hair and the top edge, as a fraction of height. */
const TOP_MARGIN = 0.05;

export function computeLayout(geom: FaceGeometry, type: PhotoType, outW: number, outH: number, adj: Adjustments): Layout {
  const headHeight = geom.crownAbove + geom.chinBelow;
  const autoScale = (midpoint(type.headHeightRatio) * outH) / headHeight;
  const scale = autoScale * adj.zoom;

  // Aim for the middle of the eye-line range, but keep the crown inside the frame.
  let eyeRatio = midpoint(type.eyeLineFromBottomRatio);
  const maxEyeRatio = 1 - TOP_MARGIN - (geom.crownAbove * autoScale) / outH;
  eyeRatio = Math.max(type.eyeLineFromBottomRatio[0], Math.min(eyeRatio, maxEyeRatio));

  return {
    scale,
    rotation: -geom.roll + (adj.rotateDeg * Math.PI) / 180,
    eyeOut: { x: outW / 2 + adj.offsetX * outW, y: outH - eyeRatio * outH + adj.offsetY * outH },
  };
}

export interface Compliance {
  headRatio: number;
  eyeRatio: number;
  headOk: boolean;
  eyeOk: boolean;
}

export function checkCompliance(geom: FaceGeometry, layout: Layout, type: PhotoType, outH: number): Compliance {
  const headRatio = ((geom.crownAbove + geom.chinBelow) * layout.scale) / outH;
  const eyeRatio = (outH - layout.eyeOut.y) / outH;
  const within = (v: number, [lo, hi]: [number, number]) => v >= lo - 0.005 && v <= hi + 0.005;
  return {
    headRatio,
    eyeRatio,
    headOk: within(headRatio, type.headHeightRatio),
    eyeOk: within(eyeRatio, type.eyeLineFromBottomRatio),
  };
}
