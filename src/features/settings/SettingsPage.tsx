import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type ReactNode } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { db } from '../../db/db';
import { hasDemoData, removeDemoData, seedDemoData } from '../../db/seed/demo';
import { setSetting, useSetting } from '../../db/settings';
import { APP_NAME } from '../../config/app';
import { BackupSection } from './BackupSection';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK', 'PLN', 'CAD', 'AUD', 'JPY'];

export function SettingsPage() {
  const currency = useSetting('currency');
  const demo = useLiveQuery(hasDemoData, []);
  const counts = useLiveQuery(async () => ({
    items: await db.items.count(),
    looks: await db.looks.count(),
    entries: await db.journal.count(),
  }));
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-page">
      <PageHeader title="Settings" back backTo="/closet" />
      <div className="mx-auto max-w-xl space-y-6 px-4 pb-8">
        <Section title="General">
          <Row label="Currency">
            <select
              value={currency}
              onChange={(e) => setSetting('currency', e.target.value)}
              className="rounded-lg border border-line bg-card px-3 py-2"
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Row>
        </Section>

        <BackupSection Section={Section} />

        <Section title="Demo data">
          <p className="text-sm text-muted">
            {demo
              ? 'The app came with example pieces, looks and journal days. Remove them when you are ready to use your own closet. Your own pieces stay untouched.'
              : 'No demo data loaded.'}
          </p>
          {demo ? (
            <button
              disabled={busy}
              onClick={() => confirm('Remove all demo pieces, looks and journal days?') && run(removeDemoData)}
              className="tap mt-3 w-full rounded-xl border border-accent px-4 py-3 font-medium text-accent disabled:opacity-50"
            >
              Remove demo data
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={() => run(seedDemoData)}
              className="tap mt-3 w-full rounded-xl border border-line px-4 py-3 font-medium disabled:opacity-50"
            >
              Load demo data
            </button>
          )}
        </Section>

        <Section title="Storage">
          <p className="text-sm text-muted">
            Everything is stored only on this device, in this browser.
            {counts && ` ${counts.items} pieces · ${counts.looks} looks · ${counts.entries} journal days.`}
          </p>
        </Section>

        <p className="text-center text-xs text-muted">{APP_NAME} · prototype</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4">
      <h2 className="mb-3 font-serif text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span>{label}</span>
      {children}
    </label>
  );
}
