# Tire Hub — project notes

Static marketing + order site for Tire Hub, a tire shop in Egypt. Arabic (Egyptian dialect), RTL.
Plain HTML/CSS/JS. No framework, no build step, no npm dependencies. Must keep working when
`index.html` is opened from disk (file://) and on any static host.

## Hard rules (do not break)

- The site advertises ONE service only: **replacing car tires at the customer's home or workplace**.
  Never mention repair, balancing, alignment, oil change, battery, towing or roadside assistance.
- Never invent prices, discounts, guarantees, delivery/arrival times, coverage areas, ratings or reviews.
  Coverage is always "we confirm on the call".
- Never hard-code a phone number. Phone / order email / form endpoint come from `assets/js/config.js`
  (`window.TIREHUB = { phone, email, formEndpoint }`). Footer shows `01X XXXX XXXX` when `phone` is empty.
- Copy is Egyptian Arabic. Keep the existing wording unless asked to change it.
- No emoji, no purple/blue gradients, no cream+serif look, no wall of identical rounded shadow cards,
  no centered-everything layouts.

## Files

- `index.html` — hero (van on a road strip), #service (3 joined cells), #how (4 steps), #size (asphalt band),
  brands, #faq (`<details>`), red closing CTA band.
- `order.html` — order form + live summary card + confirmation view.
- `assets/css/style.css` — all styles, both pages. Design tokens on `:root`, dark mode via `prefers-color-scheme`.
- `assets/js/config.js` — the only file the owner edits.
- `assets/js/main.js` — shared: fills `[data-phone]` from config.
- `assets/js/order.js` — size selects, phone sanitising (Arabic digits → Latin), validation, summary,
  ref `TH-xxxxxx`, email via FormSubmit, POST to `formEndpoint` (JSON), reset.
  Orders go by email only: the owner chose no WhatsApp hand-off, so don't add one back.
- `assets/img/` — `logo.webp` (version for dark backgrounds: header and footer are always asphalt), `van.webp` (the real branded van, transparent, side view facing left, wheels at the bottom edge),
  `wheel.webp`, `favicon.png`, `og.jpg` (1200×630).

## Design system

- Tokens: `--bg --surface --sunken --ink --muted --line --red --red-ink --asphalt --asphalt-2 --lane --ok --err`.
  Light = cool concrete; dark overrides in the `prefers-color-scheme: dark` block.
- Red is an accent only; the closing CTA band is the one red background.
- Motifs: asphalt bands, dashed yellow lane markings (`--lane`), sidewall lettering.
- Fonts (Google Fonts): Alexandria 500/700/800 (headings), IBM Plex Sans Arabic 400/500/600 (body),
  sidewall numbers via the `.sw` class.
  - Note: Google Fonts ships "Saira Condensed" without italics, so `.sw` uses **Saira** at
    `font-stretch: 75%` (its condensed width) with the true italic, weights 700/800. Same design, real italic.
  - `.sw` always sets `direction: ltr` so sizes like `205/55 R16` read correctly inside RTL text.
- Breakpoints: 960px (order page stacks), 860px (index sections stack), 760px (nav hidden), 560px (phone).
  Must have no horizontal scroll at 390px.
- Focus: visible yellow outline (`:focus-visible`). `prefers-reduced-motion` disables the van slide-in
  and smooth scrolling.

## Order form behaviour

- Validation messages appear after the first submit attempt, then update on blur (and clear while typing).
- First invalid field gets focused and scrolled into view. Errors are inline, never `alert()`.
- Phone: `/^01[0125][0-9]{8}$/`. Size required unless "مش عارف المقاس" is checked; then notes are required.
- Submit: build message → if `email`, POST to FormSubmit (`https://formsubmit.co/ajax/<email>`, Arabic-labelled
  fields, `_template: table`; `success: "false"` counts as failure) and/or POST JSON to `formEndpoint`
  (Google Apps Script URLs are sent as `text/plain` to avoid a CORS preflight) → on any failure show the inline
  error and stop → show confirmation.

## Testing

Serve the folder (`npx http-server -p 8080` or `python3 -m http.server`) and check both pages at desktop
width and at 390px, in light and dark, and submit a full order.
