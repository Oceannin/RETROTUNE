# Local player adapter API

Base URL: `http://127.0.0.1:47832`. The service is loopback-only. All writes require `X-Retrotune-Token`, available from **Editor → Sources → Copy pairing key** or `data/token.txt`. Never put the key in your OBS URL or share it in a screenshot.

## Publish a track

`POST /api/ingest`, `Content-Type: application/json`:

```json
{
  "id": "my-player:main",
  "label": "My player",
  "title": "A little break in the clouds",
  "artist": "Example artist",
  "album": "Cloud City",
  "cover": "https://example.com/artwork.jpg",
  "position": 42.5,
  "duration": 224,
  "rate": 1,
  "playing": true
}
```

Send the current state every **1–3 seconds** and immediately after a seek, pause or track change. The source expires after **12 seconds** without a heartbeat. The server timestamps each sample; the renderer interpolates position while playing.

- Position and duration are nonnegative seconds; use duration `0` if it is unknown. Position is clamped to duration. Playback rate is `0–16`.
- Artwork must be an HTTPS URL or a PNG/JPEG/WebP base64 data URL; SVG and arbitrary local paths are rejected. HTTPS artwork may still be blocked by its provider. Requests are limited to 3 MB.
- Source IDs `auto`, `demo` and the `windows:` prefix are reserved. Use a stable ID owned by your adapter. Up to 64 external sources can be active.
- `playing` must be a boolean. Strings have size limits and numeric values must be finite.

## Remove a source

`POST /api/remove-source` with the token header and `{"id":"my-player:main"}`.

## Read state / update settings

| Route | Result |
| --- | --- |
| `GET /api/state` | `settings`, the selected `track` or `null`, and `serverTime` |
| `GET /api/bootstrap` | State plus `sources`, `windowsStatus` and the local pairing `token` |
| `PUT /api/settings` | Validates, persists and returns settings; token required |

**Settings writes are full replacements.** Read the current object first, change the fields you need, and send it back. Omitted fields use defaults. `language` is `ru` or `en`; older presets default to Russian. Editor dark/light mode is a local browser preference, not a setting broadcast to OBS.

Explicit source selection never falls back to another source. `auto` selects the first playing source, or the first available source when none is playing.

The Host header is restricted to `127.0.0.1:47832` and `localhost:47832`. No public cross-origin read access is enabled. This API is for trusted local adapters, not remote hosting.
