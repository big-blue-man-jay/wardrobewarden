import { createHashRouter, Navigate, RouterProvider } from 'react-router';
import { AppLayout, type RouteHandle } from './components/layout/AppLayout';
import { AddItemPage } from './features/add/AddItemPage';
import { ClosetPage } from './features/closet/ClosetPage';
import { InsightsPage } from './features/insights/InsightsPage';
import { ItemPage } from './features/item/ItemPage';
import { JournalPage } from './features/journal/JournalPage';
import { LooksPage } from './features/looks/LooksPage';
import { Placeholder } from './features/Placeholder';
import { SettingsPage } from './features/settings/SettingsPage';
import { TodayPage } from './features/today/TodayPage';

// Hash routing works on any static host and offline without server rewrites.
const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'closet', element: <ClosetPage /> },
      { path: 'closet/:id', element: <ItemPage /> },
      { path: 'add', element: <AddItemPage />, handle: { hideTabBar: true } satisfies RouteHandle },
      { path: 'looks', element: <LooksPage /> },
      { path: 'looks/new', element: <Placeholder title="New look" milestone="M4" back /> },
      { path: 'looks/:id', element: <Placeholder title="Look" milestone="M4" back /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'journal/:date', element: <Placeholder title="Journal entry" milestone="M5" back /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/today" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
