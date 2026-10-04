# Wardrobe Warden

A personal, phone-first wardrobe app: a digital closet, an outfit builder, an Outfit-of-the-Day journal and
insights to wear more of what you own. Everything runs in the browser and stays on the device (IndexedDB).
No accounts, no backend, no API keys.

**Live app:** https://big-blue-man-jay.github.io/wardrobewarden/

## Run it

```bash
npm install
npm run dev          # http://localhost:5173 (also on your Wi-Fi, see below)
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build (with service worker) on :4173
npm test             # unit tests (filters, wear stats, insights, looks, dates, backup, demo data)
```

Requires Node 20+.

## Install it on your phone

Every push to `claude/wardrobe-prototype-vaixut` (or `main`) builds and publishes the app to GitHub Pages
via `.github/workflows/deploy.yml` (one-time setup: repo **Settings → Pages → Source: GitHub Actions**).

- **iPhone:** open the link in **Safari** → Share → **Add to Home Screen**.
- **Android:** open the link in **Chrome** → ⋮ → **Install app**.
- After the first open it works offline. Updates install themselves; if the app looks stale, close it fully and reopen.
- Your data lives only in your phone's browser; the website just serves the app code. Anyone opening the link
  gets their own empty copy and can't see or change your data.
- **Back up regularly:** Settings → Backup → **Export all data** (a .zip with all records and photos; on a phone
  the share sheet opens, so you can save it to Files / iCloud Drive). **Import backup** restores it on any device.

### Dev server on your phone (same Wi-Fi)

1. `npm run dev`: it already listens on all interfaces (`server.host: true`, same as `vite --host`).
2. Open the `Network:` URL Vite prints (e.g. `http://192.168.1.23:5173`) on your phone. Find your IP manually
   with `ipconfig getifaddr en0` (macOS), `ipconfig` (Windows) or `hostname -I` (Linux). If it doesn't load,
   allow Node through your computer's firewall.

Browsers only allow service workers on `https://` or `localhost`, so over `http://192.168…` the app works and
saves data, but won't install or work offline. Each address has its own separate data; use Export/Import to
move it.

## Edit the preset tags

All tags live in **`src/config/tags.ts`**: categories and their types, the 16 colors (+ multicolor), seasons,
occasions and materials. Data stores only the stable `id` (e.g. `'olive'`), never the label, so:

- **Rename** freely: change `label` (and a color's `hex`); existing pieces pick up the new name.
- **Add** an option by adding `{ id, label }` to the list (ids: lowercase, no spaces).
- **Avoid deleting** an id that pieces use; they'd keep the id but it would show as raw text. Rename instead.
- New *categories* also need a slot rule in `src/lib/looks.ts` if they should appear in the outfit builder.

Other knobs (currency default, the 60-day "forgotten" threshold, image sizes) are in
`src/config/app.ts`.

## What's built

- **Today** (start screen): date, today's outfit photo or a shortcut to snap it, this week's outfits, streak,
  a daily "forgotten piece" nudge.
- **Closet**: grid of cutouts on neutral tiles; search (name, brand, notes); combinable filters (category, type,
  color, season, occasion, material, brand, favorites, not worn in 60+ days, never worn) shown as removable
  chips that persist while navigating; sort by newest, name, most/least worn, recently worn, price, cost per wear.
- **Add piece**: take or choose a photo → tap preset chips → save in seconds. Photos with a transparent
  background (e.g. iPhone "lift subject") are kept as cutouts. Partial purchase dates (year / month / day /
  don't remember), optional details, auto-generated names, remembered seasons/occasions, duplicate notice.
- **Piece profile ("Steckbrief")**: photo (tap to switch cutout/original and choose which one the closet uses),
  basics, purchase with "owned for", usage (times worn, first/last worn, cost per
  wear, looks), wear history, notes; every section edits on its own; style this, log as worn today, delete.
- **Looks**: outfit builder with slots (top, bottom/dress, layers, shoes, bag, accessories), item picker with the
  closet's filters, live flat-lay collage, name/occasion/season; looks list filterable by occasion and season;
  wear today, edit, duplicate, delete.
- **Journal**: month calendar with each day's mirror photo or flat-lay, list view, day editor (pieces or a saved
  look, photo, 1–5 rating, occasion, note), previous/next day, missed days, save as look. Wear stats are always
  derived from the journal.
- **Insights**: pieces, wardrobe value, average cost per wear; palette grid (one square per piece in its main
  color) and color breakdown; categories; forgotten pieces with "style this"; most/least worn; best/worst value;
  days logged per month.
- **Settings**: currency, backup export/import, demo data.
- **PWA**: installable, offline, demo data on first launch.

## Where things live

| Path | What |
| --- | --- |
| `src/config/` | Preset tags (`tags.ts`) and app settings (`app.ts`) |
| `src/db/` | Dexie schema, all reads/writes, derived wear stats, backup, demo seed data |
| `src/image/` | Resizing, thumbnails, transparency detection and trimming of cutouts |
| `src/lib/` | Pure logic: filters/sort, looks/slots/collage layout, insights, dates, naming |
| `src/features/` | One folder per screen |
| `src/components/` | Shared UI (tab bar, sheets, chips, item tiles, collage, pickers) |

## Cutouts

There is no built-in background removal (it was tried and removed to keep the app small and free of AGPL
code). For clean flat-lay cutouts, use the phone's own feature, e.g. on iPhone touch and hold the piece in
Photos to lift it from the background, then save or share it as an image. When you add a photo that already has
a transparent background, the app keeps it as the cutout automatically (`hasTransparency` in
`src/image/resize.ts`); otherwise the photo is used as is. Pieces with both photos can switch between them on
their profile.

## Data model notes (changes vs. the brief)

- `Item.preferOriginal`: both photos are kept; this records whether the original is shown instead of the cutout.
  `thumbnail` always matches the photo in use.
- `isDemo` on items, looks and journal entries, so "Remove demo data" deletes only demo records.
- `createdAt` / `updatedAt` on all records.
- `JournalEntry.photoThumb`: small copy of the mirror photo for the calendar and lists.
- A `settings` key/value table (currency, last-used seasons/occasions, last backup…).
- Wear counts, first/last worn and cost per wear are always derived from journal entries (one source of truth).
- "Not worn in 60+ days" counts from the last wear; never-worn pieces count from when they were added, so a new
  piece isn't instantly "forgotten".
- Looks and journal entries store only `itemIds`, in outfit order; slots are rebuilt from each piece's category
  (a second top or outerwear becomes a layer; anything that doesn't fit a free slot is still shown).

## Known limitations

- Data lives in one browser on one device. Clearing the browser's website data deletes it, and on iPhone,
  using the app in a Safari tab (instead of from the Home Screen) lets Safari clear it after about a week
  without a visit. Install it to the Home Screen and **export backups**. The app asks for persistent storage.
- No sync between devices; move data with Export/Import (it replaces everything on the target device).
- No built-in background removal; cutouts come from the phone's own feature (see Cutouts).
- Colors are the tags you pick, not detected from the photo.
- One journal entry per day; future days can't be planned.
- Demo garments are simple drawings.

## Next-step ideas

- Archive / "donated" status instead of deleting, with a "pieces I let go" history.
- "Worn about N times before I started logging" field to seed wear counts for older pieces.
- Planned outfits for future days and packing lists for trips.
- Weather-aware suggestions; "outfit of the day" ideas from least-worn pieces.
- Auto-tagging colors from the cutout; custom tags.
- Share a look or piece as an image via the share sheet.
- Optional encrypted cloud backup or device-to-device sync.
- Wishlist with "what would this go with?" using existing pieces.
