import { useEffect, useRef, useState } from "react";
import { downloadBlob, jpegUnderSize, maybeWatermark, toJpeg, type FittedJpeg } from "../export/encode";
import { renderSheet, sheetToPdf } from "../export/printSheet";
import type { PhotoType } from "../photoTypes";
import { Button, Card } from "./common";
import { useI18n } from "./i18n";
import { Slider } from "./Slider";

export function ExportPanel({ photo, type }: { photo: HTMLCanvasElement | null; type: PhotoType }) {
  const { t } = useI18n();
  const [maxKb, setMaxKb] = useState(type.maxFileKb ?? 200);
  const [fitted, setFitted] = useState<FittedJpeg | null>(null);
  const [sheet, setSheet] = useState<{ canvas: HTMLCanvasElement; count: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const sheetView = useRef<HTMLCanvasElement>(null);

  useEffect(() => setMaxKb(type.maxFileKb ?? 200), [type]);

  // Re-encode after sliders settle; encoding is the slow part on phones.
  useEffect(() => {
    if (!photo) return;
    let stale = false;
    const id = setTimeout(async () => {
      const result = await jpegUnderSize(maybeWatermark(photo), maxKb);
      if (!stale) setFitted(result);
    }, 300);
    return () => {
      stale = true;
      clearTimeout(id);
    };
  }, [photo, maxKb]);

  useEffect(() => {
    if (!photo) return;
    const id = setTimeout(() => {
      const s = renderSheet(maybeWatermark(photo));
      setSheet(s);
      const view = sheetView.current;
      if (view) {
        view.width = Math.round(s.canvas.width / 3);
        view.height = Math.round(s.canvas.height / 3);
        const ctx = view.getContext("2d")!;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(s.canvas, 0, 0, view.width, view.height);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [photo]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <h2 className="mb-3 text-lg font-bold">{t.exportSingle}</h2>
        <Slider label={t.maxSize} min={20} max={1000} step={10} value={maxKb} onChange={setMaxKb} display={`${maxKb} KB`} />
        <p className="mt-2 min-h-5 text-sm text-slate-600" data-testid="file-info">
          {fitted && (fitted.fits ? t.fileInfo(Math.ceil(fitted.blob.size / 1024), Math.round(fitted.quality * 100)) : t.tooBigForLimit)}
        </p>
        <Button className="mt-3 w-full" disabled={!fitted?.fits} onClick={() => fitted && downloadBlob(fitted.blob, `${type.id}-photo.jpg`)}>
          {t.downloadJpg}
        </Button>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">{t.exportSheet}</h2>
        {sheet && <p className="mb-3 text-sm text-slate-600">{t.sheetInfo(sheet.count)}</p>}
        <div className="mb-3 flex justify-center">
          <canvas ref={sheetView} className="checker max-h-[45vh] w-auto max-w-full rounded shadow ring-1 ring-slate-200" style={{ aspectRatio: "1181 / 1772" }} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="secondary"
            disabled={!sheet || busy}
            onClick={() => run(async () => downloadBlob(await toJpeg(sheet!.canvas, 0.95), `${type.id}-print-sheet-10x15.jpg`))}
          >
            {busy ? t.preparing : t.downloadSheetJpg}
          </Button>
          <Button
            variant="secondary"
            disabled={!sheet || busy}
            onClick={() => run(async () => downloadBlob(await sheetToPdf(sheet!.canvas), `${type.id}-print-sheet-10x15.pdf`))}
          >
            {busy ? t.preparing : t.downloadSheetPdf}
          </Button>
        </div>
      </Card>
    </>
  );
}
