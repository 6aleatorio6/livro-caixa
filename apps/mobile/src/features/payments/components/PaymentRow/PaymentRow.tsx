import { router } from 'expo-router';

import { EntryItem } from '@/shared/components/EntryItem/EntryItem';
import { entryMarkKindOf } from '@/shared/utils/entry/entryMarkKindOf';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

import type { IPaymentRow } from '../../types/PaymentRow';
import { paymentEntrySupportOf } from '../../utils/paymentEntrySupportOf';

export interface IPaymentRowProps {
  row: IPaymentRow;
  people: IAllowedEmailListItem[];
  /** O membro do chip escolhido; `null` em "Todos". */
  chosenUid: string | null;
}

/**
 * Uma parte na lista de Pagamentos: a linha do lançamento, que abre os detalhes dele, ou, na parte que é uma
 * contribuição, os detalhes da contribuição.
 */
export function PaymentRow({ row, people, chosenUid }: IPaymentRowProps) {
  const { entry, amountCents, contribution } = row;

  return (
    <EntryItem
      kind={entryMarkKindOf(entry)}
      name={entry.name}
      amountCents={amountCents}
      onPress={() => router.push({ pathname: '/entries/[id]', params: { id: contribution?.id ?? entry.id } })}
      support={paymentEntrySupportOf(row, people, chosenUid)}
    />
  );
}
