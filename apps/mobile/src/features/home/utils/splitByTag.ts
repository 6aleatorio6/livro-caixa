import type { ITag } from '@/shared/types/tag/Tag';

import type { IMonthSummary } from '../types/MonthSummary';
import type { ITagSplit } from '../types/TagSplit';

/**
 * Divide o mês por tag: o pago e o a pagar de cada uma, do maior pago para o menor (empate pelo nome).
 * Só entram tags com pago ou a pagar; o que não tem tag, ou tem uma tag que não está na lista, fica fora.
 */
export function splitByTag(summary: Pick<IMonthSummary, 'toPay' | 'paid'>, tags: ITag[]): ITagSplit[] {
  const splits = new Map<string, ITagSplit>(tags.map((tag) => [tag.id, { tag, paidCents: 0, toPayCents: 0 }]));

  summary.paid.forEach((entry) => {
    const split = entry.tagId === null ? undefined : splits.get(entry.tagId);
    if (split) split.paidCents += entry.amountCents;
  });
  summary.toPay.forEach(({ bill }) => {
    const split = bill.tagId === null ? undefined : splits.get(bill.tagId);
    if (split) split.toPayCents += bill.expectedAmountCents;
  });

  return [...splits.values()]
    .filter((split) => split.paidCents > 0 || split.toPayCents > 0)
    .sort((a, b) => b.paidCents - a.paidCents || a.tag.name.localeCompare(b.tag.name));
}
