import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { bgRemovalAssets } from './scripts/bgRemovalAssets';

export default defineConfig({
  // Relative base so the build works from any static host path (e.g. GitHub Pages /repo/).
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    bgRemovalAssets({ dir: 'bg-removal', model: 'small' }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Wardrobe Warden',
        short_name: 'Wardrobe',
        description: 'My personal wardrobe, outfit journal and closet insights.',
        theme_color: '#F6F3EE',
        background_color: '#F6F3EE',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // The background-removal worker bundles the ONNX runtime (~1 MB); precache it so removal works offline.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Model + runtime files (~85 MB): too big to precache, so cache on first use, then serve offline.
            urlPattern: ({ url }) => url.pathname.includes('/bg-removal/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bg-removal',
              expiration: { maxEntries: 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  server: { host: true },
});
