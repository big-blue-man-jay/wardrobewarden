import { createHashRouter, Navigate, RouterProvider } from 'react-router';
import { AppLayout, type RouteHandle } from './components/layout/AppLayout';
import { TodayPage } from './features/today/TodayPage';

const fullScreen = { hideTabBar: true } satisfies RouteHandle;

// Today (the start screen) is bundled up front; every other screen loads on demand.
// All chunks are precached by the service worker, so this works offline too.
const router = createHashRouter([
  {
    element: <AppLayout />,
    // Shown for a moment when the app opens directly on a lazily loaded screen.
    hydrateFallbackElement: <div className="min-h-dvh bg-paper" />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'closet', lazy: async () => ({ Component: (await import('./features/closet/ClosetPage')).ClosetPage }) },
      { path: 'closet/:id', lazy: async () => ({ Component: (await import('./features/item/ItemPage')).ItemPage }) },
      {
        path: 'add',
        handle: fullScreen,
        lazy: async () => ({ Component: (await import('./features/add/AddItemPage')).AddItemPage }),
      },
      { path: 'looks', lazy: async () => ({ Component: (await import('./features/looks/LooksPage')).LooksPage }) },
      {
        path: 'looks/new',
        handle: fullScreen,
        lazy: async () => ({ Component: (await import('./features/looks/LookBuilderPage')).LookBuilderPage }),
      },
      { path: 'looks/:id', lazy: async () => ({ Component: (await import('./features/looks/LookPage')).LookPage }) },
      {
        path: 'looks/:id/edit',
        handle: fullScreen,
        lazy: async () => ({ Component: (await import('./features/looks/LookBuilderPage')).LookBuilderPage }),
      },
      {
        path: 'journal',
        lazy: async () => ({ Component: (await import('./features/journal/JournalPage')).JournalPage }),
      },
      {
        path: 'journal/:date',
        handle: fullScreen,
        lazy: async () => ({ Component: (await import('./features/journal/EntryPage')).EntryPage }),
      },
      {
        path: 'insights',
        lazy: async () => ({ Component: (await import('./features/insights/InsightsPage')).InsightsPage }),
      },
      {
        path: 'settings',
        lazy: async () => ({ Component: (await import('./features/settings/SettingsPage')).SettingsPage }),
      },
      { path: '*', element: <Navigate to="/today" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
