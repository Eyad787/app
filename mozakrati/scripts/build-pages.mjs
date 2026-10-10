/**
 * بيبني نسخة الويب علشان تترفع على GitHub Pages تحت مسار (افتراضياً /app).
 * الاستخدام: node scripts/build-pages.mjs [/app]
 * الناتج في فولدر dist.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const base = (process.argv[2] ?? '/app').replace(/\/$/, '');
execSync('npx expo export --platform web --clear', { stdio: 'inherit', env: { ...process.env, EXPO_BASE_URL: base } });

// الروابط اللي في index.html مكتوبة من أول الموقع (/manifest.json)، فبنضيفلها المسار
const indexPath = 'dist/index.html';
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/(href|src)="(\/[^"]*)"/g, (m, attr, url) =>
  url.startsWith('//') || url.startsWith(`${base}/`) ? m : `${attr}="${base}${url}"`,
);
fs.writeFileSync(indexPath, html);

// GitHub Pages مابيعملش redirect للروابط الداخلية (زي /app/schedule)، فبيعرض 404.html
fs.copyFileSync(indexPath, 'dist/404.html');
// علشان GitHub Pages مايتجاهلش الفولدرات اللي بتبدأ بـ _ (زي _expo)
fs.writeFileSync('dist/.nojekyll', '');
console.log(`\nجاهز للرفع على المسار ${base}/ في فولدر dist`);
