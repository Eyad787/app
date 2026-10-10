import { useCallback, useEffect, useRef, useState } from "react";
import { CameraCapture } from "../camera/CameraCapture";
import { cameraSupported } from "../camera/useCamera";
import type { Issue } from "../faceAnalysis/quality";
import { analyzePhoto, fileToCanvas, NoFaceError, type AnalyzedPhoto } from "../lib/pipeline";
import { ensureModels } from "../lib/vision";
import { getPhotoTypeBySlug, midpoint, pixelSize, type PhotoType } from "../photoTypes";
import { HOME_META, typeMeta, type PageMeta } from "../seo";
import { AdSlot, Button, Card, Disclaimer, Header, IssueList, PrivacyBadge, Spinner } from "./common";
import { Editor } from "./Editor";
import { useI18n } from "./i18n";
import { TypePicker } from "./TypePicker";

type Step =
  | { name: "landing" }
  | { name: "type" }
  | { name: "source" }
  | { name: "camera" }
  | { name: "processing"; stage: "models" | "analyze" }
  | { name: "failed"; reason: "models" | "noFace"; issues?: Issue[] }
  | { name: "editor"; photo: AnalyzedPhoto };

function currentPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function applyMeta(meta: PageMeta) {
  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
}

export function App() {
  const { t, lang } = useI18n();
  const [type, setType] = useState<PhotoType | undefined>(() => getPhotoTypeBySlug(currentPath()));
  const [step, setStep] = useState<Step>({ name: "landing" });
  const fileInput = useRef<HTMLInputElement>(null);
  const lastSource = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => applyMeta(type ? typeMeta(type) : HOME_META), [type]);

  useEffect(() => {
    const onPop = () => {
      setType(getPhotoTypeBySlug(currentPath()));
      setStep({ name: "landing" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => window.scrollTo({ top: 0 }), [step.name]);

  const goHome = () => {
    if (currentPath() !== "/") history.pushState(null, "", "/");
    setType(undefined);
    setStep({ name: "landing" });
  };

  const pickType = (pt: PhotoType) => {
    setType(pt);
    if (currentPath() !== pt.slug) history.pushState(null, "", pt.slug);
    ensureModels().catch(() => {}); // start downloading while the user decides how to add a photo
    setStep({ name: "source" });
  };

  const changeTypeInEditor = (pt: PhotoType) => {
    setType(pt);
    history.replaceState(null, "", pt.slug);
  };

  const process = useCallback(
    async (source: HTMLCanvasElement) => {
      if (!type) return;
      lastSource.current = source;
      setStep({ name: "processing", stage: "models" });
      let models;
      try {
        models = await ensureModels();
      } catch {
        setStep({ name: "failed", reason: "models" });
        return;
      }
      setStep({ name: "processing", stage: "analyze" });
      // Let the spinner paint before the synchronous model calls block the thread.
      await new Promise((r) => setTimeout(r, 50));
      try {
        const targetHead = midpoint(type.headHeightRatio) * pixelSize(type).height;
        setStep({ name: "editor", photo: await analyzePhoto(models, source, targetHead) });
      } catch (err) {
        setStep({ name: "failed", reason: "noFace", issues: err instanceof NoFaceError ? err.issues : undefined });
      }
    },
    [type],
  );

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await process(await fileToCanvas(file));
    } catch {
      setStep({ name: "failed", reason: "noFace" });
    }
  };

  const typeName = type && (lang === "ar" ? type.nameAr : type.nameEn);

  return (
    <div className="min-h-dvh">
      <Header onHome={goHome} />
      <AdSlot slot="top-banner" />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        {step.name === "landing" && (
          <>
            <section className="space-y-4 py-4 text-center">
              <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{typeName ? t.typeHeroTitle(typeName) : t.heroTitle}</h1>
              <p className="text-slate-600">{t.heroSubtitle}</p>
              <Button className="w-full max-w-sm py-4 text-lg" onClick={() => (type ? pickType(type) : setStep({ name: "type" }))}>
                📷 {t.ctaStart}
              </Button>
              <PrivacyBadge />
            </section>
            {type ? (
              <Card>
                <h2 className="mb-2 font-bold">{typeName}</h2>
                <p className="text-sm text-slate-600" dir="ltr">
                  {t.sizeMm(type.widthMm, type.heightMm)} · {pixelSize(type).width}×{pixelSize(type).height}px
                </p>
                <p className="mt-2 text-sm text-slate-700">{lang === "ar" ? type.notesAr : type.notesEn}</p>
              </Card>
            ) : (
              <TypePicker onPick={pickType} />
            )}
            <Tips />
            <Disclaimer />
          </>
        )}

        {step.name === "type" && (
          <>
            <TypePicker selected={type} onPick={pickType} />
            <Button variant="ghost" onClick={() => setStep({ name: "landing" })}>
              {t.back}
            </Button>
          </>
        )}

        {step.name === "source" && type && (
          <>
            <h2 className="text-xl font-bold">{t.howToGetPhoto}</h2>
            <p className="text-sm text-slate-600">{typeName}</p>
            <div className="grid gap-3">
              {cameraSupported() && (
                <Button className="py-4 text-lg" onClick={() => setStep({ name: "camera" })}>
                  📷 {t.useCamera}
                </Button>
              )}
              <Button variant="secondary" className="py-4 text-lg" onClick={() => fileInput.current?.click()}>
                🖼️ {t.uploadPhoto}
              </Button>
            </div>
            <PrivacyBadge />
            <Tips />
            <Button variant="ghost" onClick={() => setStep({ name: "type" })}>
              {t.back}
            </Button>
          </>
        )}

        {step.name === "camera" && <CameraCapture onCapture={process} onCancel={() => setStep({ name: "source" })} />}

        {step.name === "processing" && <Spinner label={step.stage === "models" ? t.loadingModels : t.processing} />}

        {step.name === "failed" && (
          <Card className="space-y-3 text-center">
            {step.reason === "models" ? <p className="font-semibold text-red-700">{t.modelsFailed}</p> : <IssueList issues={step.issues ?? [{ code: "noFace", blocking: true }]} />}
            {step.reason === "noFace" && <p className="text-sm text-slate-600">{t.noFaceHelp}</p>}
            <div className="flex justify-center gap-2">
              {step.reason === "models" && lastSource.current && <Button onClick={() => process(lastSource.current!)}>{t.retry}</Button>}
              <Button variant="secondary" onClick={() => setStep({ name: "source" })}>
                {t.back}
              </Button>
            </div>
          </Card>
        )}

        {step.name === "editor" && type && <Editor photo={step.photo} type={type} onTypeChange={changeTypeInEditor} onRestart={() => setStep({ name: "source" })} />}
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-8 text-center text-xs text-slate-400">{t.footerSpecs}</footer>
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} data-testid="file-input" />
    </div>
  );
}

function Tips() {
  const { t } = useI18n();
  return (
    <Card>
      <h2 className="mb-2 font-bold">{t.tipsTitle}</h2>
      <ul className="list-disc space-y-1 ps-5 text-sm text-slate-700">
        {t.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </Card>
  );
}
