import { Outlet, ScrollRestoration } from 'react-router';
import { TabBar } from './TabBar';

export function AppLayout() {
  return (
    <>
      <main className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <TabBar />
      <ScrollRestoration />
    </>
  );
}
