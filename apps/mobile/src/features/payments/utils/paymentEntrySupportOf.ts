import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { memberNamesOf } from '@/shared/utils/person/memberNamesOf';

import type { IPaymentRow } from '../types/PaymentRow';

/**
 * O detalhe da linha de uma conta em Pagamentos, sem a tag (o grupo diz): o pagamento, "pago em 05/10" (e o previsto,
 * quando o pago foi outro valor); a conta avulsa, "12/10 · avulsa". Quem pagou entra no chip "Todos" ("pago em 05/10 ·
 * Ana") e no chip de quem só contribuiu ("paga por Ana em 11/10"); no chip de quem pagou, o chip marcado já diz. A
 * conta paga só pelas contribuições diz de quem elas vieram.
 */
export function paymentEntrySupportOf(
  { entry, parts }: IPaymentRow,
  people: IAllowedEmailListItem[],
  chosenUid: string | null,
) {
  if (entry.paidBy === null) {
    return `dia ${entry.dueDay} · contribuições de ${memberNamesOf(
      parts.map(({ uid }) => uid),
      people,
    )}`;
  }

  const payerName = memberNameOf(entry.paidBy, people);
  const isPaidByChosen = chosenUid === null || chosenUid === entry.paidBy;
  if (entry.kind === 'oneOffBill') {
    return [formatDayMonth(entry.date), 'avulsa', chosenUid === entry.paidBy ? undefined : payerName]
      .filter(Boolean)
      .join(' · ');
  }
  if (!isPaidByChosen) return `paga por ${payerName} em ${formatDayMonth(entry.paidOn)}`;

  return [`pago em ${formatDayMonth(entry.paidOn)}`, chosenUid === null ? payerName : undefined, paymentTailOf(entry)]
    .filter(Boolean)
    .join(' · ');
}
