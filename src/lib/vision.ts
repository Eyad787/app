// Lazy loader for MediaPipe. Nothing here is fetched until ensureModels() runs,
// which happens only after the user picks a photo type.
import type { FaceLandmarker, ImageSegmenter } from "@mediapipe/tasks-vision";

const base = import.meta.env.BASE_URL;

export interface VisionModels {
  segmenter: ImageSegmenter;
  landmarker: FaceLandmarker;
}

let loading: Promise<VisionModels> | null = null;

export function ensureModels(): Promise<VisionModels> {
  if (!loading) {
    loading = load().catch((err) => {
      loading = null; // allow a retry after a network failure
      throw err;
    });
  }
  return loading;
}

async function load(): Promise<VisionModels> {
  const { FilesetResolver, ImageSegmenter, FaceLandmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);
  // CPU delegate: slower than GPU on flagships, but predictable on mid-range Android.
  const [segmenter, landmarker] = await Promise.all([
    ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${base}models/selfie_segmenter.tflite`, delegate: "CPU" },
      runningMode: "IMAGE",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    }),
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${base}models/face_landmarker.task`, delegate: "CPU" },
      runningMode: "IMAGE",
      numFaces: 2,
    }),
  ]);
  return { segmenter, landmarker };
}
