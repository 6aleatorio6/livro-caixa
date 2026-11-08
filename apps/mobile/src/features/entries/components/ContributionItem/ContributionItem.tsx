import { DetailRow } from '@/shared/components/DetailRow/DetailRow';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IContributionItemProps {
  contribution: IContributionEntry;
  /** O primeiro nome de quem contribuiu. */
  contributorName: string;
}

/**
 * Uma contribuição na lista dos detalhes de um lançamento: uma linha de texto com quem e quando, e quanto. O
 * comprovante e os detalhes dela abrem por Pagamentos.
 */
export function ContributionItem({ contribution, contributorName }: IContributionItemProps) {
  return (
    <DetailRow
      label={`${contributorName} · ${formatDayMonth(contribution.paidOn)}`}
      value={formatCents(contribution.amountCents)}
    />
  );
}
