/** App-wide settings that aren't tags. */
export const APP_NAME = 'Wardrobe Warden';

/** Default currency; can be changed in Settings. */
export const DEFAULT_CURRENCY = 'EUR';

/** A piece counts as "forgotten" after this many days without being worn
 *  (counted from when it was added if it has never been worn). */
export const FORGOTTEN_AFTER_DAYS = 60;

export const IMAGE_MAX_EDGE = 1200;
export const THUMB_MAX_EDGE = 360;
export const IMAGE_QUALITY = 0.85;

/** Background removal model: 'small' (~44 MB, good on phones) or 'medium' (~88 MB, slightly better edges).
 *  Must match the model copied by scripts/bgRemovalAssets.ts in vite.config.ts. */
export const BG_REMOVAL_MODEL = 'small' as const;
/** Where the model files are served from, relative to the app. */
export const BG_REMOVAL_PATH = 'bg-removal/';
