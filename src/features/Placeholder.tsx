import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

/** Temporary screen for features coming in a later milestone. */
export function Placeholder({ title, milestone, back }: { title: string; milestone: string; back?: boolean }) {
  return (
    <div className="animate-page">
      <PageHeader title={title} back={back} />
      <EmptyState title="Coming soon">This screen is built in {milestone}.</EmptyState>
    </div>
  );
}
