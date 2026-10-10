import { detectFaces, measureFace, primaryFace, type FaceGeometry } from "../faceAnalysis/geometry";
import { checkFrame, type Issue } from "../faceAnalysis/quality";
import { maskToCanvas, segmentPerson } from "../segmentation/segment";
import type { VisionModels } from "./vision";

/** Longest side kept from the original; plenty for a 600 px output, kind to phone memory. */
const MAX_SOURCE_SIDE = 2000;

export interface AnalyzedPhoto {
  source: HTMLCanvasElement;
  maskCanvas: HTMLCanvasElement;
  geom: FaceGeometry;
  issues: Issue[];
}

export async function fileToCanvas(file: Blob): Promise<HTMLCanvasElement> {
  // createImageBitmap honours EXIF orientation, so phone photos come out upright.
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    return drawScaled(bmp, bmp.width, bmp.height);
  } finally {
    bmp.close();
  }
}

export function drawScaled(src: CanvasImageSource, w: number, h: number, mirror = false): HTMLCanvasElement {
  const k = Math.min(1, MAX_SOURCE_SIDE / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (mirror) {
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

export class NoFaceError extends Error {
  issues: Issue[];
  constructor(issues: Issue[]) {
    super("No usable face found");
    this.issues = issues;
  }
}

export async function analyzePhoto(models: VisionModels, source: HTMLCanvasElement, targetHeadPx: number): Promise<AnalyzedPhoto> {
  const { landmarker, segmenter } = models;
  await landmarker.setOptions({ runningMode: "IMAGE" });
  const { faces } = detectFaces(landmarker, source);
  const face = primaryFace(faces, source.width, source.height);
  const issues = checkFrame(faces, face, source, source.width, source.height, { framing: false });
  if (!face) throw new NoFaceError(issues);

  const mask = segmentPerson(segmenter, source);
  const geom = measureFace(face, source.width, source.height, mask);
  if (geom.headCutOff) issues.push({ code: "headCutOff", blocking: false });
  if (geom.crownAbove + geom.chinBelow < targetHeadPx * 0.6) issues.push({ code: "lowResolution", blocking: false });
  return { source, maskCanvas: maskToCanvas(mask), geom, issues };
}
