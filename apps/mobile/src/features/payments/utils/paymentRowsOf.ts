import type { IEntry } from '@/shared/types/entry/Entry';
import { billAmountOf } from '@/shared/utils/entry/billAmountOf';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';

import type { IPaymentRow } from '../types/PaymentRow';

/**
 * As contas do mês na lista de Pagamentos, na ordem em que chegam. Em "Todos" (`uid` `null`), cada conta aparece uma
 * vez, pelo valor pago. No chip de um membro, aparece a conta em que ele tem parte, contando só a parte dele: a de quem
 * pagou, o valor pago menos as contribuições; a de quem contribuiu, a contribuição. O pagamento sem dono não dá parte a
 * ninguém, e só aparece para quem contribuiu nele.
 */
export function paymentRowsOf(entries: IEntry[], uid: string | null): IPaymentRow[] {
  const parts = memberPartsOf(entries);

  return entries.flatMap((entry): IPaymentRow[] => {
    if (entry.kind === 'contribution') return [];
    const billParts = parts.filter((part) => part.entry.id === entry.id);
    const countedParts = uid === null ? billParts : billParts.filter((part) => part.uid === uid);
    if (countedParts.length === 0) return [];

    const amountCents = billAmountOf(entry, entries);
    return [
      { entry, amountCents, countedCents: uid === null ? amountCents : sumCents(countedParts), parts: billParts },
    ];
  });
}
