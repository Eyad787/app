# صورة رسمية — ID / passport photos in the browser

Turns a selfie into an official-style ID or passport photo **entirely on the user's device**.
There is no backend: images never leave the browser. MediaPipe runs locally via WebAssembly.

Outputs:
1. A single photo JPG at the type's pixel size (300 DPI), with a max-file-size slider.
2. A 10×15 cm (4×6 in) print sheet at 300 DPI (1181×1772 px), as JPG and PDF, with cut lines.

## Setup & run

Requires Node 22.18+ (the build-time prerender script imports TypeScript directly).

```bash
cd id-photo-web
npm install
npm run dev        # http://localhost:5173
```

`npm run dev` / `npm run build` first run `scripts/fetch-assets.mjs`, which copies the MediaPipe
WASM runtime into `public/mediapipe/` and downloads the two models into `public/models/`
(~4 MB, one time). These are git-ignored and served from your own domain.

```bash
npm run build      # type-check, bundle, prerender SEO pages, write sitemap.xml + robots.txt
npm run preview    # serve dist/ at http://localhost:4173
```

## Deploy to Vercel

1. Import the repo in Vercel and set **Root Directory** to `id-photo-web`.
2. Framework preset: **Vite** (build `npm run build`, output `dist`). Node version: 22.x.
3. Add the environment variable `VITE_SITE_URL=https://your-domain.com` (used for canonical
   links, `sitemap.xml` and `robots.txt`).
4. Deploy. `vercel.json` enables clean URLs and long caching for the models.

Netlify works too (`netlify.toml` is included; set the base directory to `id-photo-web`).

## Project layout

```
src/
  photoTypes.ts          ← ALL photo specs (sizes, background, head/eye ratios). Edit here.
  config.ts              ← feature flags (watermark, ad slots), site URL
  seo.ts                 ← Arabic titles/descriptions per page (also used at build time)
  lib/vision.ts          ← lazy MediaPipe loader (ImageSegmenter + FaceLandmarker)
  lib/pipeline.ts        ← upload → analyze (faces, mask, measurements, quality issues)
  segmentation/          ← person mask from the selfie segmenter
  faceAnalysis/          ← landmarks → eye line, roll, chin, crown; brightness/blur/size checks
  cropping/              ← layout (scale/rotate/position to the spec) + render
                           (guided-filter mask refinement, 1–2 px feather, background fill)
  export/                ← JPEG under a size limit, watermark flag, print sheet + PDF
  camera/                ← getUserMedia + oval guide + live checks
  ui/                    ← React screens, i18n (Arabic RTL first, English toggle)
scripts/
  fetch-assets.mjs       ← copies WASM, downloads models
  prerender.mjs          ← static HTML per photo type, sitemap.xml, robots.txt
```

## How the pipeline works

1. The photo is drawn to a canvas (EXIF orientation applied, max 2000 px).
2. **FaceLandmarker** finds the face: iris centers → eye line and head roll, landmark 152 → chin.
3. **ImageSegmenter** (selfie model) gives a person mask; the code walks up through the mask
   from the forehead to find the top of the hair (the "crown").
4. The photo is rotated so the eyes are level, scaled so *crown→chin* matches the middle of
   `headHeightRatio`, and positioned so the eye line matches `eyeLineFromBottomRatio`.
5. The coarse mask is refined with a guided filter (so edges follow hair and shoulders),
   feathered 1–2 px, and composited over `bgColor`.
6. The editor shows live head-height / eye-line readings against the spec, plus zoom, move,
   rotate and brightness controls.

## Photo specs

Every value in `src/photoTypes.ts` is a **placeholder** marked `// TODO: verify from official source`.
Confirm each one with the issuing authority before launch. To add a type, add an entry there:
it automatically gets a picker item, an SEO page at its `slug`, and a sitemap entry (add a
title and description in `src/seo.ts`).

## Monetization hooks (not integrated)

- `<AdSlot slot="top-banner" />` and `<AdSlot slot="below-result" />` in `src/ui/common.tsx`
  render empty placeholders. Put the ad network tag inside.
- `FEATURES.watermarkOnFreeDownloads` in `src/config.ts` (off by default) stamps
  `WATERMARK_TEXT` on downloaded photos and sheets.

## Notes

- The first time a user picks a photo type, the site downloads ~11 MB of WASM and ~4 MB of
  models, which are then cached. Nothing ML-related loads on the landing page.
- On 10×15 cm paper only two 2×2 in (US) photos fit, because two side by side (101.6 mm) are
  wider than the 100 mm sheet.
- Final acceptance is always up to the issuing authority; the UI says so.
