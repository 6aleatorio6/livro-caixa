import type { ITag } from '@/shared/types/tag/Tag';

/** O que uma tag pagou no mês e o que ainda falta pagar nela; `tag: null` é a linha do que não tem tag. */
export interface ITagSplit {
  tag: ITag | null;
  paidCents: number;
  toPayCents: number;
}
