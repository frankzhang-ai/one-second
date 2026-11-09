# ONE SECOND

A small, offline-capable timing game built with plain HTML, CSS, and JavaScript modules. It has no build step, backend, ads, external fonts, or CDN dependencies. Cookie-less GoatCounter analytics records `game-start`, `game-over` (by score band), `second-game`, `return-d1`, and `return-day1` events. Analytics is optional and the game continues to work when its script is unavailable.

## Rules

Tap when the moving peach dot reaches the mint arc. A hit earns one point and builds your combo; a miss costs one of three lives and resets the combo. Every five consecutive hits increases speed and narrows the target. Your best score and sound preference are saved in local storage.

## Run locally

From this directory, start a static server:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Service workers need localhost or HTTPS. To install on iPhone, serve over HTTPS and choose Safari's Share → Add to Home Screen.

Run the game logic checks with:

```sh
node tests/judge.test.mjs
node tests/analytics.test.mjs
```

## Files

- `index.html`, `styles.css`: app structure and responsive styling
- `js/`: game rules, canvas drawing, touch and keyboard input, sound, storage, and app flow
- `manifest.webmanifest`, `sw.js`: install metadata and offline cache
- `icons/`, `splash/`: app icons and iOS startup images
- `tests/judge.test.mjs`: angle judgment, difficulty, and combo checks
- `tests/analytics.test.mjs`: analytics score band checks
- `tools/make_icons.py`: regenerate PNG icons and startup images (requires Pillow)
