import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

interface ToastAction {
  label: string;
  to: string;
}
interface ToastState {
  id: number;
  message: string;
  action?: ToastAction;
}

const ToastContext = createContext<(message: string, action?: ToastAction) => void>(() => {});

export const useToast = () => useContext(ToastContext);

/** Small confirmation message above the tab bar (or below the header on full-screen flows). */
export function ToastProvider({ children, atTop = false }: { children: ReactNode; atTop?: boolean }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number>(undefined);
  const navigate = useNavigate();

  const show = useCallback((message: string, action?: ToastAction) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, action });
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className={`animate-page fixed inset-x-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-paper shadow-lg ${
            // Full-screen flows have their own bottom action bar; keep toasts clear of it.
            atTop ? 'top-[calc(4rem+env(safe-area-inset-top))]' : 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]'
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          {toast.action && (
            <button
              className="tap font-medium text-accent-soft underline underline-offset-2"
              onClick={() => {
                setToast(null);
                navigate(toast.action!.to);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}
