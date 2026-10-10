import { useEffect, useMemo, useRef, useState } from "react";
import { checkCompliance, computeLayout, DEFAULT_ADJUSTMENTS, type Adjustments } from "../cropping/layout";
import { renderPhoto } from "../cropping/render";
import type { AnalyzedPhoto } from "../lib/pipeline";
import { PHOTO_TYPES, pixelSize, type PhotoType } from "../photoTypes";
import { AdSlot, Button, Card, Disclaimer, IssueList } from "./common";
import { ExportPanel } from "./ExportPanel";
import { useI18n } from "./i18n";
import { Slider } from "./Slider";

interface Props {
  photo: AnalyzedPhoto;
  type: PhotoType;
  onTypeChange: (t: PhotoType) => void;
  onRestart: () => void;
}

export function Editor({ photo, type, onTypeChange, onRestart }: Props) {
  const { t, lang } = useI18n();
  const [adj, setAdj] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [rendered, setRendered] = useState<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = pixelSize(type);

  const layout = useMemo(() => computeLayout(photo.geom, type, width, height, adj), [photo, type, width, height, adj]);
  const compliance = checkCompliance(photo.geom, layout, type, height);

  // Re-render at most once per frame while sliders move.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const out = renderPhoto({
        source: photo.source,
        mask: photo.maskCanvas,
        geom: photo.geom,
        layout,
        width,
        height,
        bgColor: type.bgColor,
        brightness: adj.brightness,
      });
      const view = previewRef.current;
      if (view) {
        view.width = out.width;
        view.height = out.height;
        view.getContext("2d")!.drawImage(out, 0, 0);
      }
      setRendered(out);
    });
    return () => cancelAnimationFrame(id);
  }, [photo, layout, width, height, type.bgColor, adj.brightness]);

  const set = (patch: Partial<Adjustments>) => setAdj((a) => ({ ...a, ...patch }));
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{t.preview}</h2>
          <select
            aria-label={t.photoType}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
            value={type.id}
            onChange={(e) => onTypeChange(PHOTO_TYPES.find((p) => p.id === e.target.value)!)}
          >
            {PHOTO_TYPES.map((p) => (
              <option key={p.id} value={p.id}>
                {lang === "ar" ? p.nameAr : p.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-center">
          <canvas
            ref={previewRef}
            data-testid="preview"
            className="checker max-h-[55vh] w-auto max-w-full rounded-md shadow-md ring-1 ring-slate-200"
            style={{ aspectRatio: `${width} / ${height}` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
          <SpecChip label={t.headHeight} value={pct(compliance.headRatio)} ok={compliance.headOk} />
          <SpecChip label={t.eyeLine} value={pct(compliance.eyeRatio)} ok={compliance.eyeOk} />
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600" dir="ltr">
            {width}×{height}px
          </span>
        </div>
        {type.notesAr && <p className="mt-3 text-sm text-slate-600">{lang === "ar" ? type.notesAr : type.notesEn}</p>}
      </Card>

      <IssueList issues={photo.issues} />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.adjust}</h2>
          <button className="text-sm font-semibold text-brand-700" onClick={() => setAdj(DEFAULT_ADJUSTMENTS)}>
            {t.reset}
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label={t.zoom} min={0.7} max={1.4} step={0.01} value={adj.zoom} onChange={(zoom) => set({ zoom })} display={pct(adj.zoom)} />
          <Slider label={t.rotate} min={-10} max={10} step={0.5} value={adj.rotateDeg} onChange={(rotateDeg) => set({ rotateDeg })} display={`${adj.rotateDeg}°`} />
          {/* In RTL the slider's visual direction flips, so negate to keep "drag right = move right". */}
          <Slider
            label={t.moveX}
            min={-0.2}
            max={0.2}
            step={0.005}
            value={lang === "ar" ? -adj.offsetX : adj.offsetX}
            onChange={(v) => set({ offsetX: lang === "ar" ? -v : v })}
          />
          <Slider label={t.moveY} min={-0.2} max={0.2} step={0.005} value={adj.offsetY} onChange={(offsetY) => set({ offsetY })} />
          <Slider label={t.brightness} min={-40} max={40} step={1} value={adj.brightness} onChange={(brightness) => set({ brightness })} display={`${adj.brightness}`} />
        </div>
      </Card>

      <ExportPanel photo={rendered} type={type} />

      <AdSlot slot="below-result" />
      <Disclaimer />
      <Button variant="ghost" className="w-full" onClick={onRestart}>
        {t.startOver}
      </Button>
    </div>
  );
}

function SpecChip({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  const { t } = useI18n();
  return (
    <span className={`rounded-full px-2 py-1 font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
      {label}: <span dir="ltr">{value}</span> · {ok ? t.withinSpec : t.outsideSpec}
    </span>
  );
}
