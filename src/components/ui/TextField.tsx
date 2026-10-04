import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base = 'w-full rounded-xl border border-line bg-card px-3.5 py-3 text-base outline-none focus:border-ink';

export function TextField({ label, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input className={base} {...rest} />
    </label>
  );
}

export function TextArea({ label, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <textarea className={`${base} min-h-28 resize-y`} {...rest} />
    </label>
  );
}

/** Accepts "12.50" and "12,50"; empty → undefined. */
export function parsePrice(s: string): number | undefined {
  const n = parseFloat(s.replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : undefined;
}
