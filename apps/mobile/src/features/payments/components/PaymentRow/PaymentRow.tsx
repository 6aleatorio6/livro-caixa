import { router } from 'expo-router';

import { EntryItem } from '@/shared/components/EntryItem/EntryItem';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { formatCents } from '@/shared/utils/format/formatCents';

import type { IChipSelection } from '../../types/ChipSelection';
import type { IPaymentRow } from '../../types/PaymentRow';
import { paymentEntrySupportOf } from '../../utils/paymentEntrySupportOf';
import { paymentRowMarkKindOf } from '../../utils/paymentRowMarkKindOf';

export interface IPaymentRowProps {
  row: IPaymentRow;
  people: IAllowedEmailListItem[];
  /** Quem está marcado nos chips: o texto de apoio muda com ele. */
  selection: IChipSelection;
}

/**
 * Uma parte na lista de Pagamentos: a de quem pagou abre os detalhes do lançamento da conta, e a contribuição, os
 * detalhes dela. As duas partes de uma conta têm o mesmo nome: o rótulo de leitura traz também o texto de apoio e o
 * valor, que as distinguem.
 */
export function PaymentRow({ row, people, selection }: IPaymentRowProps) {
  const { entry, amountCents, contribution } = row;
  const support = paymentEntrySupportOf(row, people, selection);

  return (
    <EntryItem
      kind={paymentRowMarkKindOf(row)}
      name={entry.name}
      amountCents={amountCents}
      onPress={() => router.push({ pathname: '/entries/[id]', params: { id: contribution?.id ?? entry.id } })}
      support={support}
      accessibilityLabel={`${entry.name}, ${support}, ${formatCents(amountCents)}`}
    />
  );
}
