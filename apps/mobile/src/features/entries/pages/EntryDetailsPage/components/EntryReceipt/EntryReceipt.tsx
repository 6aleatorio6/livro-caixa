import { router } from 'expo-router';

import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

export interface IEntryReceiptProps {
  /** O lançamento dono do comprovante: um que o tenha (o pagamento sem dono não tem, e por isso não entra aqui). */
  entry: IOwnedEntry | IContributionEntry;
  /** O texto de cima no lugar do tipo e do tamanho, para a folha que mostra mais de um comprovante. */
  heading?: string;
}

/** O comprovante de um lançamento nos detalhes: o arquivo e o Ver, que abre o comprovante inteiro com o id do lançamento. */
export function EntryReceipt({ entry, heading }: IEntryReceiptProps) {
  const { data: file } = useRealtime(receiptFileQueryService, { id: entry.receiptFileId });

  return (
    <ReceiptSummary
      heading={heading}
      file={file ? { name: file.name, type: file.type, sizeBytes: file.sizeBytes } : null}
      disabled={!file}
      action={{
        label: 'Ver',
        onPress: () => router.push({ pathname: '/entries/[id]/receipt', params: { id: entry.id } }),
      }}
    />
  );
}
