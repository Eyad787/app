// Copies the MediaPipe WASM runtime into public/ and downloads the two models
// once, so the deployed site serves everything from its own origin.
// Run automatically before `dev` and `build`.
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const WASM_FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

const MODELS = {
  "selfie_segmenter.tflite":
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
  "face_landmarker.task":
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
};

async function exists(p) {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

await mkdir(join(pub, "mediapipe/wasm"), { recursive: true });
for (const f of WASM_FILES) {
  await copyFile(join(root, "node_modules/@mediapipe/tasks-vision/wasm", f), join(pub, "mediapipe/wasm", f));
}

await mkdir(join(pub, "models"), { recursive: true });
for (const [name, url] of Object.entries(MODELS)) {
  const dest = join(pub, "models", name);
  if (await exists(dest)) continue;
  console.log(`Downloading ${name} …`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}
console.log("MediaPipe assets ready.");
