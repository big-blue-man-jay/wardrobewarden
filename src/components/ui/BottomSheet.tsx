import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Slide-up sheet anchored to the bottom of the screen. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-backdrop absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="animate-sheet pb-safe relative mx-auto max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card shadow-xl">
        <div className="sticky top-0 z-10 bg-card px-5 pt-3 pb-2">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" />
          {title && <h2 className="font-serif text-xl">{title}</h2>}
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
