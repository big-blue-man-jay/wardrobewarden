import type { ReactNode } from 'react';

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="animate-page mx-auto flex max-w-xs flex-col items-center px-6 py-16 text-center">
      {icon && <div className="mb-4 rounded-full bg-tile p-4 text-muted">{icon}</div>}
      <h2 className="font-serif text-xl">{title}</h2>
      {children && <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>}
    </div>
  );
}
