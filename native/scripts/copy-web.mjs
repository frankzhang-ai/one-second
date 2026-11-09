import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'native/www');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'manifest.webmanifest', 'privacy.html']) {
  await cp(resolve(root, file), resolve(out, file));
}
for (const dir of ['js', 'icons']) await cp(resolve(root, dir), resolve(out, dir), { recursive: true });
let html = await readFile(resolve(out, 'index.html'), 'utf8');
html = html.replace(/\s*<link\b[^>]*rel=["']manifest["'][^>]*>/i, '');
html = html.replace(/\s*<link\b[^>]*rel=["']apple-touch-startup-image["'][^>]*>/gi, '');
html = html.replace(/<script\s+data-goatcounter=["'][^"']*["']\s+async\s+src=["'][^"']*["']\s*>\s*<\/script>/i,
  `<script data-goatcounter="https://onesecond.goatcounter.com/count" data-goatcounter-settings='{"allow_local": true, "no_onload": true}' async src="https://gc.zgo.at/count.js"></script>`);
await writeFile(resolve(out, 'index.html'), html);
