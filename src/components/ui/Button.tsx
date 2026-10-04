import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const STYLES: Record<Variant, string> = {
  primary: 'bg-ink text-paper',
  secondary: 'border border-line bg-card text-ink',
  danger: 'border border-accent text-accent bg-card',
  ghost: 'text-ink',
};

export function Button({
  variant = 'primary',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`tap inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-medium disabled:opacity-40 disabled:active:scale-100 ${STYLES[variant]} ${className}`}
      {...rest}
    />
  );
}
