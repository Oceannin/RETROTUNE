# Changelog

## 0.2.0 — 2026-11-06

### Added

- Complete dark and light editor themes, saved independently from the on-stream widget palette.
- Saved English/Russian localization for the editor and overlay, including help, notifications, empty states and accessibility labels.
- Localized browser-extension popup and manifest, a custom extension icon and an OS-aware popup theme.
- EN/RU properties for the optional OBS Lua helper.
- A public streamer-focused project page, design case study, real demo screenshots and setup/API guides.
- Windows CI, locale/theme browser checks and backwards-compatibility coverage for older presets.

### Compatibility

Older presets continue to load and default to Russian. No pairing-key rotation or audio-source change is required. Reload an installed unpacked extension after updating its files. Python 3.12 x64 remains the verified bridge runtime; other players and browser versions may expose different metadata.

## 0.1.0 — 2026-11-06

- Initial local now-playing overlay, live editor, five layouts, four widget palettes and modular display elements.
- Windows media sessions, exact-tab Chromium extension and token-protected local adapter API.
- Marquee text, pause-aware CD animation, transparent OBS output, presets and Windows launchers.
- Original desktop icon and shortcut creator.
