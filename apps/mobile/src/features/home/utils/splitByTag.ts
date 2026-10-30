import type { ITag } from '@/shared/types/tag/Tag';

import type { IMonthSummary } from '../types/MonthSummary';
import type { ITagSplit } from '../types/TagSplit';

/**
 * Divide o mês por tag: o pago e o a pagar de cada uma, do maior pago para o menor (empate pelo nome). Só entram
 * linhas com pago ou a pagar. O que não tem tag, ou tem uma tag que não está na lista, vai para a linha sem tag
 * (`tag: null`), sempre a última: cada conta tem no máximo uma tag, então as linhas somam o mês sem contar nada duas vezes.
 */
export function splitByTag(summary: Pick<IMonthSummary, 'toPay' | 'paid'>, tags: ITag[]): ITagSplit[] {
  const splitsByTagId = new Map(tags.map((tag) => [tag.id, { tag, paidCents: 0, toPayCents: 0 }]));
  const untagged: ITagSplit = { tag: null, paidCents: 0, toPayCents: 0 };
  const splitOf = (tagId: string | null) => (tagId === null ? undefined : splitsByTagId.get(tagId)) ?? untagged;

  summary.paid.forEach((entry) => {
    splitOf(entry.tagId).paidCents += entry.amountCents;
  });
  summary.toPay.forEach(({ bill }) => {
    splitOf(bill.tagId).toPayCents += bill.expectedAmountCents;
  });

  const hasAmount = (split: ITagSplit) => split.paidCents > 0 || split.toPayCents > 0;
  const tagged = [...splitsByTagId.values()]
    .filter(hasAmount)
    .sort((a, b) => b.paidCents - a.paidCents || a.tag.name.localeCompare(b.tag.name, 'pt-BR'));

  return hasAmount(untagged) ? [...tagged, untagged] : tagged;
}
