import { useRef, useState } from 'react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { BackupError, type BackupData, type BackupSummary } from '../../db/backup';
import { exportAll, importAll, readBackup } from '../../db/backupDb';
import { useSetting } from '../../db/settings';
import { todayISO } from '../../lib/dates';
import { plural } from '../../lib/format';

/** Hands a file to the user: the share sheet on phones (→ "Save to Files"), otherwise a download. */
async function saveFile(bytes: Uint8Array, name: string): Promise<void> {
  const file = new File([bytes.slice()], name, { type: 'application/zip' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err; // user closed the share sheet
    }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function BackupSection({
  Section,
}: {
  Section: React.ComponentType<{ title: string; children: React.ReactNode }>;
}) {
  const toast = useToast();
  const lastBackupAt = useSetting('lastBackupAt');
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [pending, setPending] = useState<{ data: BackupData; summary: BackupSummary } | null>(null);

  const doExport = async () => {
    setBusy('export');
    try {
      const { bytes, summary } = await exportAll();
      await saveFile(bytes, `wardrobe-backup-${todayISO()}.zip`);
      toast(
        `Exported ${plural(summary.items, 'piece')}, ${plural(summary.looks, 'look')}, ${plural(summary.entries, 'day')}`,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error(err);
        toast('Export failed. Is the device storage full?');
      }
    } finally {
      setBusy(null);
    }
  };

  const pick = async (file: File) => {
    setBusy('import');
    try {
      setPending(await readBackup(new Uint8Array(await file.arrayBuffer())));
    } catch (err) {
      toast(err instanceof BackupError ? err.message : "Couldn't read that file.");
    } finally {
      setBusy(null);
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    setBusy('import');
    try {
      await importAll(pending.data);
      toast('Backup restored');
    } catch (err) {
      console.error(err);
      toast('Import failed. Nothing was changed.');
    } finally {
      setPending(null);
      setBusy(null);
    }
  };

  return (
    <Section title="Backup">
      <p className="text-sm text-muted">
        Everything lives only in this browser. Export a backup now and then (a .zip with all data and photos) and keep
        it somewhere safe, e.g. Files or iCloud Drive.
      </p>
      <p className="mt-2 text-xs text-muted">
        Last export: {lastBackupAt ? new Date(lastBackupAt).toLocaleDateString() : 'never'}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={doExport}
          disabled={!!busy}
          className="tap min-h-12 rounded-xl bg-ink px-4 font-medium text-paper disabled:opacity-50"
        >
          {busy === 'export' ? 'Exporting…' : 'Export all data'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={!!busy}
          className="tap min-h-12 rounded-xl border border-line bg-card px-4 font-medium disabled:opacity-50"
        >
          {busy === 'import' ? 'Reading…' : 'Import backup'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".zip,application/zip"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void pick(f);
        }}
      />
      <ConfirmDialog
        open={!!pending}
        title="Replace everything with this backup?"
        confirmLabel="Replace and restore"
        danger
        onCancel={() => setPending(null)}
        onConfirm={confirmImport}
      >
        {pending && (
          <>
            The backup from {new Date(pending.summary.exportedAt).toLocaleString()} has{' '}
            {plural(pending.summary.items, 'piece')}, {plural(pending.summary.looks, 'look')} and{' '}
            {plural(pending.summary.entries, 'journal day')}. Everything currently on this device will be replaced.
          </>
        )}
      </ConfirmDialog>
    </Section>
  );
}
