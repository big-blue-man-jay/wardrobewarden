import { Outlet, ScrollRestoration, useMatches } from 'react-router';
import { ClosetFilterProvider } from '../../hooks/useClosetFilter';
import { ToastProvider } from '../ui/Toast';
import { TabBar } from './TabBar';

export interface RouteHandle {
  /** Full-screen flows (add piece, editors) hide the tab bar and show their own bottom action bar. */
  hideTabBar?: boolean;
}

export function AppLayout() {
  const matches = useMatches();
  const hideTabBar = matches.some((m) => (m.handle as RouteHandle | undefined)?.hideTabBar);
  return (
    <ToastProvider atTop={hideTabBar}>
      <ClosetFilterProvider>
        <main className={hideTabBar ? 'min-h-dvh' : 'min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]'}>
          <Outlet />
        </main>
        {!hideTabBar && <TabBar />}
        <ScrollRestoration />
      </ClosetFilterProvider>
    </ToastProvider>
  );
}
