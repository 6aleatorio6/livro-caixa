import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

import type { IChipSelection } from '../types/ChipSelection';
import type { IPaymentRow } from '../types/PaymentRow';

/**
 * O detalhe da linha de uma parte em Pagamentos, sem a tag (o grupo diz). A parte de quem pagou: "pago em 05/10" (e o
 * previsto, quando o pago foi outro valor) ou, na conta avulsa, "12/10 · avulsa"; havendo contribuições, que ela é só
 * uma parte ("sua parte" no chip de quem está logado, "parte de Ana" nos demais). A contribuição: "contribuição em
 * 12/10", "para Ana" (quem pagou a conta). Com várias pessoas marcadas, ou todas, o nome vai no fim, de quem pagou ou
 * de quem contribuiu, porque o chip não diz de quem é a linha.
 */
export function paymentEntrySupportOf(
  { entry, uid, amountCents, contribution }: IPaymentRow,
  people: IAllowedEmailListItem[],
  selection: IChipSelection,
) {
  const isSeveral = selection.kind === 'everyone' || selection.kind === 'several';
  const name = memberNameOf(uid, people);

  if (contribution) {
    const payee = entry.paidBy === null ? undefined : `para ${memberNameOf(entry.paidBy, people)}`;
    return joinSupport([`contribuição em ${formatDayMonth(contribution.paidOn)}`, isSeveral ? name : payee]);
  }

  // O previsto compara com o pago inteiro: numa parte, que é só o que sobrou das contribuições, não diz nada.
  const isPart = amountCents !== entry.amountCents;
  const partLabel = selection.kind === 'me' ? 'sua parte' : `parte de ${name}`;
  const payerLabel = isSeveral ? name : undefined;
  const owner = isPart ? partLabel : payerLabel;
  const tail = entry.paidBy !== null && !isPart ? paymentTailOf(entry) : undefined;
  const paid =
    entry.kind === 'oneOffBill' ? [formatDayMonth(entry.date), 'avulsa'] : [`pago em ${formatDayMonth(entry.paidOn)}`];

  return joinSupport([...paid, owner, tail]);
}

function joinSupport(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' · ');
}
