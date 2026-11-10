#!/bin/bash
# Build /preview/ copy from current working tree into $1 (a checkout of main)
set -e
SRC=/workspace/one-second; DST="$1/preview"
rm -rf "$DST"; mkdir -p "$DST"
cp -r $SRC/index.html $SRC/styles.css $SRC/js $SRC/icons "$DST/"
rm -f "$DST/js/native.js.bak"
python3 - "$DST" <<'PY'
import sys,re
d=sys.argv[1]
p=d+'/index.html'; s=open(p).read()
s=re.sub(r'\s*<script data-goatcounter[^>]*></script>','',s)
s=re.sub(r'\s*<link rel="manifest"[^>]*>','',s)
s=re.sub(r'\s*<link rel="apple-touch-startup-image"[^>]*>','',s)
s=s.replace('href="./privacy.html"','href="../privacy.html"')
s=s.replace('<meta charset="utf-8">','<meta charset="utf-8">\n    <meta name="robots" content="noindex">',1)
s=re.sub(r'<title>\s*ONE SECOND\s*</title>','<title>ONE SECOND (preview)</title>',s)
assert 'goatcounter' not in s
open(p,'w').write(s)
p=d+'/js/main.js'; s=open(p).read()
old="} else if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});"
assert old in s
s=s.replace(old,"}\n// Preview build: no service worker, no analytics.")
# native unregister branch is irrelevant on web; keep.
open(p,'w').write(s)
p=d+'/js/analytics.js'; s=open(p).read()
s=s.replace("export function track(name, title) {","export function track(name, title) {\n  return; // preview: analytics disabled")
s=s.replace("export function trackWhenReady(name, title) {","export function trackWhenReady(name, title) {\n  return; // preview: analytics disabled")
open(p,'w').write(s)
PY
echo built "$DST"
