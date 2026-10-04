import { useState } from 'react';
import { useParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useItem } from '../../db/items';
import { NO_WEAR, useItemEntries, wearByItem } from '../../db/wear';
import { ItemEditor, type EditorKind } from './editors';
import { ItemActions } from './ItemActions';
import { ItemHeader } from './ItemHeader';
import { BasicsSection, NotesSection, PurchaseSection, UsageSection, WearHistorySection } from './sections';

/** Piece profile ("Steckbrief"): a fact sheet with independently editable sections. */
export function ItemPage() {
  const { id } = useParams();
  const item = useItem(id);
  const entries = useItemEntries(id);
  const [editor, setEditor] = useState<EditorKind | null>(null);

  if (item === null) {
    return (
      <div>
        <PageHeader title="Not found" back backTo="/closet" />
        <EmptyState title="This piece doesn't exist anymore" />
      </div>
    );
  }
  if (!item || !entries) return <PageHeader title="" back backTo="/closet" />;

  const wear = wearByItem(entries).get(item.id) ?? NO_WEAR;

  return (
    <div className="animate-page">
      <PageHeader title="" back backTo="/closet" />
      <div className="mx-auto max-w-xl space-y-6 px-4 pb-10">
        <ItemHeader item={item} onEditName={() => setEditor('name')} />
        <BasicsSection item={item} edit={setEditor} />
        <PurchaseSection item={item} edit={setEditor} />
        <UsageSection item={item} wear={wear} />
        <WearHistorySection entries={entries} />
        <NotesSection item={item} edit={setEditor} />
        <ItemActions item={item} />
      </div>
      <ItemEditor item={item} kind={editor} onClose={() => setEditor(null)} />
    </div>
  );
}
