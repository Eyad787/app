// Writes one static HTML file per page (/, /passport-photo, /id-photo, …) with its own
// Arabic title, description and visible heading, plus sitemap.xml and robots.txt.
// The React app then takes over in the browser.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PAGES } from "../src/seo.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const site = (process.env.VITE_SITE_URL || "https://example.com").replace(/\/+$/, "");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const url = (path) => (path === "/" ? `${site}/` : `${site}${path}`);

const template = await readFile(join(dist, "index.html"), "utf8");

for (const page of ALL_PAGES) {
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url(page.path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="ar_EG" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url(page.path)}" />`,
  ].join("\n    ");
  // Crawlers without JS still see a heading and description; React replaces it on load.
  const body = `<main style="max-width:48rem;margin:auto;padding:1rem;font-family:sans-serif"><h1>${esc(page.h1)}</h1><p>${esc(page.description)}</p></main>`;
  const html = template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head)
    .replace("<!--seo:body-->", body);
  const out = page.path === "/" ? join(dist, "index.html") : join(dist, page.path.slice(1), "index.html");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, html);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ALL_PAGES.map((p) => `  <url><loc>${url(p.path)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemap);
await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`Prerendered ${ALL_PAGES.length} pages for ${site}`);
