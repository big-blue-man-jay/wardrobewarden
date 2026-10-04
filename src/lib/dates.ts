/** Date helpers. Journal dates are local calendar days as 'YYYY-MM-DD' strings. */

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Parse 'YYYY-MM-DD' as a local date (not UTC). */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Whole days from `a` to `b` (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = parseISODate(b).getTime() - parseISODate(a).getTime();
  return Math.round(ms / 86_400_000);
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const monthName = (m: number) => MONTHS_LONG[m];

/** e.g. "Mon, 4 Oct" (year added when not the current year). */
export function formatDay(iso: string): string {
  const d = parseISODate(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}${sameYear ? '' : ` ${d.getFullYear()}`}`;
}

// ---- Partial purchase dates: 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD' ----

export type DatePrecision = 'year' | 'month' | 'day';

export function partialDatePrecision(s: string): DatePrecision {
  const parts = s.split('-').length;
  return parts === 1 ? 'year' : parts === 2 ? 'month' : 'day';
}

export function isValidPartialDate(s: string): boolean {
  return /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(s);
}

/** "2023", "May 2023" or "12 May 2023". */
export function formatPartialDate(s: string | undefined): string {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  if (!m) return String(y);
  if (!d) return `${MONTHS_LONG[m - 1]} ${y}`;
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** Middle of the period a partial date covers, for "owned for" maths. */
function partialDateMidpoint(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  if (!m) return new Date(y, 6, 1);
  if (!d) return new Date(y, m - 1, 15);
  return new Date(y, m - 1, d);
}

/** "3 months", "2 years", "~4 years" (approximate when only the year is known). */
export function formatOwnedFor(purchaseDate: string | undefined, now: Date = new Date()): string {
  if (!purchaseDate) return '';
  const from = partialDateMidpoint(purchaseDate);
  const approx = partialDatePrecision(purchaseDate) === 'year' ? '~' : '';
  let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  if (months < 0) return '';
  if (months < 1) return 'less than a month';
  if (months < 12) return `${approx}${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (approx || rest === 0 || years >= 5) return `${approx}${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'}, ${rest} month${rest === 1 ? '' : 's'}`;
}
