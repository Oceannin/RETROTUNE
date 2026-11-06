# Development and verification

Use Windows, Python 3.12 x64 and Node.js 22. Follow [setup](../README.md#get-it-on-your-stream), then run `npm run dev` alongside the local Python service. The Vite API proxy uses port 47832. `npm run build` produces `dist/`, which is served by Python in normal use.

## Checks

```powershell
npm run build
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
npx --yes --package @playwright/cli playwright-cli -s=retrotune open http://127.0.0.1:47832
npx --yes --package @playwright/cli playwright-cli -s=retrotune run-code --filename=tests/browser-smoke.cjs
npx --yes --package @playwright/cli playwright-cli -s=retrotune run-code --filename=tests/localization-smoke.cjs
```

The browser scripts temporarily edit widget settings and restore them in `finally`. Run them outside a live broadcast. Showcase capture uses editor-only demo data and redacts the source list/selected track from its bootstrap response; it does not publish your real music metadata.

`tests/capture-showcase.cjs` saves the actual editor/renderer to `docs/images/`, including a composed cover made from real widget captures. Create `docs/images` before running if it does not exist.

## Extension smoke

Create a local Playwright config using the installed Chromium-family executable:

```powershell
.\.venv\Scripts\python.exe tools\extension_test_config.py --browser "C:\path\to\brave.exe"
npx --yes --package @playwright/cli playwright-cli -s=retrotune-ext open http://127.0.0.1:47832 --config=output/extension-config.json
npx --yes --package @playwright/cli playwright-cli -s=retrotune-ext run-code --filename=tests/extension-smoke.cjs
npx --yes --package @playwright/cli playwright-cli -s=retrotune-ext close
```

This loads the unpacked extension in an isolated test profile under `output/`; it does not install it into a personal browser profile. An installed Brave executable was used for the recorded checks. Executable and extension-loading support differ across Chromium distributions.

## Native OBS check

`tests/obs-smoke.py` uses an already enabled local obs-websocket and reads its existing local configuration. It creates a dedicated RETROTUNE scene/source, temporarily enables Studio Mode and selects it in Preview, captures a PNG, then restores settings, Preview and Studio Mode. It verifies that the program scene and recording/streaming state remain unchanged. It does not enable or reconfigure obs-websocket. Run outside a live broadcast.

## Packaging

```powershell
npm run build
.\.venv\Scripts\python.exe tools\package.py
```

The version comes from `package.json`. The archive includes source, the built UI, docs/assets, launchers, extension, Lua helper and licenses. It excludes environments, node_modules, pairing keys/settings, local logs, browser profiles and temporary output. GitHub Actions performs the Windows build, Python tests and bundle creation on each push/PR.

## Ownership map

| File | Responsibility |
| --- | --- |
| `src/main.tsx` | Editor flow, local preferences, live settings and save queue |
| `src/Widget.tsx` | Shared OBS/editor renderer, marquee, progress and artwork fallback |
| `src/i18n.ts` | EN translations; Russian source keys; metadata is never translated |
| `src/dark.css` | Editor-only dark theme and preference controls |
| `src/model.ts` | Typed settings/track contract and widget palettes |
| `server.py` | Windows sessions, API validation, persistence and loopback hosting |
| `browser-extension/` | Exact-tab metadata relay and localized pairing popup |

The initial implementation and bundled visuals were created with AI assistance. The application icon was generated with ImageGen; the demo cover illustration is code-authored SVG. Tiny5 keeps its separate SIL OFL license.
