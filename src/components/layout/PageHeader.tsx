import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../ui/icons';

interface Props {
  title: string;
  subtitle?: string;
  /** Show a back button (goes back in history, or to `backTo` if there's none). */
  back?: boolean;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, back, backTo = '/', actions }: Props) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(backTo, { replace: true });
  };
  return (
    <header className="pt-safe sticky top-0 z-30 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-3xl items-center gap-2 px-4 py-2">
        {back && (
          <button onClick={goBack} className="tap -ml-2 rounded-full p-2" aria-label="Back">
            <ChevronLeftIcon />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className={`truncate font-serif ${back ? 'text-xl' : 'text-3xl'} leading-tight`}>{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}
