import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { requestPersistentStorage } from './db/db';
import { ensureSeeded } from './db/seed/demo';
import './index.css';

registerSW({ immediate: true });
requestPersistentStorage();

// Seed demo data before the first render so the closet never flashes empty on first launch.
ensureSeeded()
  .catch((err) => console.error('Seeding demo data failed', err))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
