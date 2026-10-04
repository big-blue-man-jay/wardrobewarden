import type { ReactNode } from 'react';

/** Fixed bar at the bottom of full-screen flows. Render it outside any animated (transformed) wrapper,
 *  otherwise `position: fixed` attaches to that wrapper instead of the screen. */
export function BottomActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto max-w-xl px-4 py-3">{children}</div>
    </div>
  );
}
