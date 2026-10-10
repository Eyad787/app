import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // MediaPipe is only pulled in after the user picks a photo type.
  optimizeDeps: { exclude: ["@mediapipe/tasks-vision"] },
});
