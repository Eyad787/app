import { useEffect, useState } from "react";
import { detectFaces, primaryFace } from "../faceAnalysis/geometry";
import { checkFrame, type Issue } from "../faceAnalysis/quality";
import { drawScaled } from "../lib/pipeline";
import { ensureModels } from "../lib/vision";
import { Button } from "../ui/common";
import { useI18n } from "../ui/i18n";
import { useCamera } from "./useCamera";

/** How often live checks run; keeps mid-range phones responsive. */
const CHECK_INTERVAL_MS = 250;

export function CameraCapture({ onCapture, onCancel }: { onCapture: (c: HTMLCanvasElement) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const { videoRef, state } = useCamera();
  const [issues, setIssues] = useState<Issue[] | null>(null);

  useEffect(() => {
    if (state !== "ready") return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      const { landmarker } = await ensureModels();
      if (stopped) return;
      await landmarker.setOptions({ runningMode: "VIDEO" });
      const tick = () => {
        const video = videoRef.current;
        if (stopped || !video) return;
        if (video.readyState >= 2) {
          const w = video.videoWidth, h = video.videoHeight;
          const { faces } = detectFaces(landmarker, video, performance.now());
          setIssues(checkFrame(faces, primaryFace(faces, w, h), video, w, h, { framing: true }));
        }
        timer = setTimeout(tick, CHECK_INTERVAL_MS);
      };
      tick();
    })().catch(() => setIssues(null));
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [state, videoRef]);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    // The preview is mirrored like a mirror; the saved photo is not.
    onCapture(drawScaled(v, v.videoWidth, v.videoHeight));
  };

  const top = issues?.[0];
  const ok = issues !== null && issues.length === 0;

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <mask id="oval-hole">
              <rect width="300" height="400" fill="white" />
              <ellipse cx="150" cy="180" rx="85" ry="115" fill="black" />
            </mask>
          </defs>
          <rect width="300" height="400" fill="rgba(0,0,0,0.45)" mask="url(#oval-hole)" />
          <ellipse cx="150" cy="180" rx="85" ry="115" fill="none" stroke={ok ? "#34d399" : "#ffffff"} strokeWidth="3" strokeDasharray={ok ? "0" : "8 6"} />
        </svg>
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-semibold text-white">
          {state === "denied" ? t.cameraDenied : state === "starting" || issues === null ? t.loadingModels : top ? t.issues[top.code] : t.lookingGood}
        </div>
      </div>
      <div className="mx-auto flex max-w-md gap-2">
        <Button variant="ghost" onClick={onCancel}>
          {t.back}
        </Button>
        <Button className="flex-1" disabled={state !== "ready"} onClick={capture}>
          📸 {t.capture}
        </Button>
      </div>
    </div>
  );
}
