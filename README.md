# Wardrobe Warden

A personal, phone-first wardrobe app: digital closet, outfit builder, Outfit-of-the-Day journal and insights.
Everything runs in the browser and stays on the device (IndexedDB). No accounts, no backend, no API keys.

> Work in progress — built in milestones. This README is completed in M8.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build (with service worker) on :4173
npm test             # unit tests (dates, demo data)
```

## Use it on your phone (hosted)

Every push to `claude/wardrobe-prototype-vaixut` (or `main`) builds and publishes the app to
**https://big-blue-man-jay.github.io/wardrobewarden/** via `.github/workflows/deploy.yml`.

- One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
- On iPhone: open the link in Safari → Share → **Add to Home Screen**. On Android: Chrome menu → **Install app**.
- Your data is stored only in your phone's browser; the website just serves the app code.
  Visitors to the link get their own empty copy and can't see or change your data.

## Open the dev server on your phone (same Wi-Fi)

1. `npm run dev` — the dev server already listens on all interfaces (`server.host: true`, same as `vite --host`).
2. Vite prints a `Network:` URL like `http://192.168.1.23:5173`. Open that on your phone.
   - Find your computer's IP manually: macOS `ipconfig getifaddr en0`, Windows `ipconfig`, Linux `hostname -I`.
   - If it doesn't load, allow Node through your computer's firewall.

**Install / offline needs HTTPS.** Browsers only enable service workers on `https://` or `localhost`,
so over `http://192.168…` the app works and saves data, but it won't install properly or work offline.
For the real installed app, deploy `dist/` to any static HTTPS host (Netlify, Cloudflare Pages, GitHub Pages).
The app uses hash routing (`#/closet`) and a relative base path, so no server configuration is needed.

Each origin (LAN address vs. hosted URL) has its own separate data. Use Export/Import (M8) to move data.

## Where things live

| Path | What |
| --- | --- |
| `src/config/tags.ts` | All preset tags (categories, subcategories, colors, seasons, occasions, materials) |
| `src/config/app.ts` | Currency default, "forgotten" threshold, image sizes |
| `src/db/` | Dexie schema, all reads/writes, demo seed data |
| `src/image/` | Image resizing and background removal |
| `src/features/` | One folder per screen (`today/` is the landing screen) |
| `src/components/` | Shared UI (tab bar, sheets, chips, item tiles) |

## Background removal

- Runs fully in the browser with `@imgly/background-removal` **1.4.5** (pinned: it's the newest version whose
  model files are published on npm as `@imgly/background-removal-data`; newer versions only ship them via
  IMG.LY's CDN).
- `scripts/bgRemovalAssets.ts` copies the "small" model (~44 MB) and the ONNX runtime files from
  `node_modules` into `dist/bg-removal/` at build time (and serves them in dev). Nothing is fetched from
  third parties. The service worker caches them on first use, so removal then works offline.
- It runs in a Web Worker (`src/image/bgRemoval.worker.ts`) behind the small `BackgroundRemover` interface in
  `src/image/backgroundRemoval.ts`; swap the implementation there.
- If it fails, is skipped, or is switched off in Settings, the original photo is used. Both photos are kept.
- **License:** `@imgly/background-removal` is AGPL-3.0. Fine for personal use; if you ever distribute or host
  the app for others, AGPL obligations apply (or IMG.LY offers a commercial license).

## Data model notes (changes vs. the brief)

- `Item.preferOriginal` — both photos are kept; this records whether the original is shown instead of the cutout.
- `isDemo` on items, looks and journal entries — lets "Remove demo data" delete only demo records.
- `createdAt` / `updatedAt` on all records.
- `JournalEntry.photoThumb` — small copy of the selfie for the calendar.
- A `settings` key/value table (currency, background removal on/off, last-used seasons/occasions).
- Wear counts, first/last worn and cost-per-wear are always derived from journal entries.
- Looks keep only `itemIds`; the builder saves them slot by slot (top, bottom/dress, layer, shoes, bag,
  accessories) and slots are rebuilt from each piece's category, so no slot field is stored. A second top
  (e.g. a cardigan) becomes the layer.
