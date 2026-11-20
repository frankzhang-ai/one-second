// Copy the production web game (repo root, NOT /preview/) into native/www and
// apply native-only changes: no analytics, no service worker, no web manifest,
// ambient audio session, safe-area padding on the bundled privacy page.
import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'native/www');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'privacy.html']) {
  await cp(resolve(root, file), resolve(out, file));
}
for (const dir of ['js', 'icons']) await cp(resolve(root, dir), resolve(out, dir), { recursive: true });

function mustReplace(text, pattern, replacement, label) {
  const next = text.replace(pattern, replacement);
  if (next === text) throw new Error(`copy-web: pattern not found (${label})`);
  return next;
}

let html = await readFile(resolve(out, 'index.html'), 'utf8');
html = mustReplace(html, /\s*<link\b[^>]*rel=["']manifest["'][^>]*>/i, '', 'manifest');
html = html.replace(/\s*<link\b[^>]*rel=["']apple-touch-startup-image["'][^>]*>/gi, '');
// Analytics are disabled in the apps (App Privacy: Data Not Collected).
html = mustReplace(html, /\s*<script\b[^>]*data-goatcounter[^>]*>\s*<\/script>/i, '', 'goatcounter');
// Sound effects follow the Ring/Silent switch and mix with other audio (iOS 17+ WebKit Audio Session API;
// AppDelegate also sets AVAudioSession .ambient).
html = mustReplace(html, /<link rel="stylesheet"/i,
  `<script>try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}</script>\n    <link rel="stylesheet"`, 'audioSession');
if (/goatcounter|gc\.zgo\.at/i.test(html)) throw new Error('copy-web: analytics still referenced in index.html');
await writeFile(resolve(out, 'index.html'), html);

let main = await readFile(resolve(out, 'js/main.js'), 'utf8');
main = mustReplace(main, /\nif \(isNative\) trackPageviewWhenReady\(\);/, '\n// native build: analytics disabled', 'pageview');
await writeFile(resolve(out, 'js/main.js'), main);
// Belt and braces: make analytics a no-op in the native bundle.
await writeFile(resolve(out, 'js/analytics.js'), `// Native build: analytics disabled (no network requests).
export function scoreBand(score) { return score < 5 ? '0-4' : score < 10 ? '5-9' : score < 20 ? '10-19' : '20+'; }
export function track() {}
export function trackWhenReady() {}
export function trackReturns() {}
`);

let privacy = await readFile(resolve(out, 'privacy.html'), 'utf8');
privacy = mustReplace(privacy, 'initial-scale=1">', 'initial-scale=1, viewport-fit=cover">', 'privacy viewport');
privacy = mustReplace(privacy, '</style>',
  'main{padding-top:calc(env(safe-area-inset-top,0px) + 24px);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 40px)}.back{padding:10px 0;font-size:17px}</style>', 'privacy safe area');
await writeFile(resolve(out, 'privacy.html'), privacy);
