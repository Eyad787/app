import type { FaceGeometry } from "../faceAnalysis/geometry";
import type { Layout } from "./layout";

export interface RenderInput {
  source: HTMLCanvasElement;
  /** Grayscale person mask (any resolution; it is stretched over the source). */
  mask: HTMLCanvasElement;
  geom: FaceGeometry;
  layout: Layout;
  width: number;
  height: number;
  bgColor: string;
  brightness: number;
  /** Feather radius in output pixels. */
  featherPx?: number;
}

function applyTransform(ctx: CanvasRenderingContext2D, geom: FaceGeometry, layout: Layout) {
  ctx.translate(layout.eyeOut.x, layout.eyeOut.y);
  ctx.rotate(layout.rotation);
  ctx.scale(layout.scale, layout.scale);
  ctx.translate(-geom.eyeMid.x, -geom.eyeMid.y);
}

function layer(width: number, height: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { c, ctx };
}

/** Separable box blur on a single-channel buffer; two passes ≈ a soft Gaussian. */
function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  if (r <= 0) return src;
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += src[y * w + Math.min(w - 1, Math.max(0, k))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / n;
      acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / n;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/**
 * Guided filter (He et al.): reshapes the coarse mask so its edges follow the
 * photo's own edges, using luminance as the guide. Fixes the blocky 256 px
 * segmentation edge around hair, ears and shoulders.
 */
function guidedFilter(guide: Float32Array, p: Float32Array, w: number, h: number, r: number, eps: number): Float32Array {
  const n = guide.length;
  const ip = new Float32Array(n);
  const ii = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    ip[i] = guide[i] * p[i];
    ii[i] = guide[i] * guide[i];
  }
  const meanI = boxBlur(guide, w, h, r);
  const meanP = boxBlur(p, w, h, r);
  const corrIP = boxBlur(ip, w, h, r);
  const corrII = boxBlur(ii, w, h, r);
  const a = new Float32Array(n);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const varI = corrII[i] - meanI[i] * meanI[i];
    a[i] = (corrIP[i] - meanI[i] * meanP[i]) / (varI + eps);
    b[i] = meanP[i] - a[i] * meanI[i];
  }
  const meanA = boxBlur(a, w, h, r);
  const meanB = boxBlur(b, w, h, r);
  const q = new Float32Array(n);
  for (let i = 0; i < n; i++) q[i] = Math.min(1, Math.max(0, meanA[i] * guide[i] + meanB[i]));
  return q;
}

function parseHex(hex: string): [number, number, number] {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Crop, scale, straighten, and put the person on a flat background. */
export function renderPhoto(input: RenderInput): HTMLCanvasElement {
  const { source, mask, geom, layout, width, height } = input;

  const person = layer(width, height);
  applyTransform(person.ctx, geom, layout);
  person.ctx.drawImage(source, 0, 0);

  const alpha = layer(width, height);
  applyTransform(alpha.ctx, geom, layout);
  alpha.ctx.drawImage(mask, 0, 0, mask.width, mask.height, 0, 0, source.width, source.height);

  const pix = person.ctx.getImageData(0, 0, width, height);
  const mdata = alpha.ctx.getImageData(0, 0, width, height).data;
  const d = pix.data;
  const coarse = new Float32Array(width * height);
  const luma = new Float32Array(width * height);
  for (let i = 0; i < coarse.length; i++) {
    coarse[i] = mdata[i * 4] / 255;
    luma[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
  }
  const refined = guidedFilter(luma, coarse, width, height, Math.max(2, Math.round(width / 100)), 1e-3);
  // Re-harden slightly so the refined edge stays crisp, then feather 1–2 px.
  for (let i = 0; i < refined.length; i++) {
    const t = Math.min(1, Math.max(0, (refined[i] - 0.15) / 0.7));
    refined[i] = t * t * (3 - 2 * t);
  }
  const r = Math.max(1, Math.round((input.featherPx ?? 1.5) / 1.5));
  const a = boxBlur(boxBlur(refined, width, height, r), width, height, r);

  const [br, bg, bb] = parseHex(input.bgColor);
  const gain = 1 + input.brightness / 100;
  for (let i = 0; i < a.length; i++) {
    const j = i * 4;
    const t = d[j + 3] === 0 ? 0 : a[i];
    d[j] = br + (Math.min(255, d[j] * gain) - br) * t;
    d[j + 1] = bg + (Math.min(255, d[j + 1] * gain) - bg) * t;
    d[j + 2] = bb + (Math.min(255, d[j + 2] * gain) - bb) * t;
    d[j + 3] = 255;
  }
  person.ctx.setTransform(1, 0, 0, 1, 0, 0);
  person.ctx.putImageData(pix, 0, 0);
  return person.c;
}
