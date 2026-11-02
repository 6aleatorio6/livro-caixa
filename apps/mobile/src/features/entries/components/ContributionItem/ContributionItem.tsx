import { router } from 'expo-router';
import { HandCoins } from 'lucide-react-native';

import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IContributionItemProps {
  contribution: IContributionEntry;
  /** O primeiro nome de quem contribuiu. */
  contributorName: string;
}

/**
 * Uma contribuição na lista dos detalhes de um lançamento: quem, quando e quanto, e o comprovante dela. Aqui ela só
 * abre o comprovante, pelo Ver; os detalhes dela abrem por Pagamentos.
 */
export function ContributionItem({ contribution, contributorName }: IContributionItemProps) {
  const { data: file } = useRealtime(receiptFileQueryService, { id: contribution.receiptFileId });

  return (
    <ReceiptSummary
      icon={HandCoins}
      heading={`${contributorName} · ${formatDayMonth(contribution.paidOn)} · ${formatCents(contribution.amountCents)}`}
      file={file ? { name: file.name, type: file.type, sizeBytes: file.sizeBytes } : null}
      disabled={!file}
      action={{
        label: 'Ver',
        onPress: () => router.push({ pathname: '/entries/[id]/receipt', params: { id: contribution.id } }),
      }}
    />
  );
}
