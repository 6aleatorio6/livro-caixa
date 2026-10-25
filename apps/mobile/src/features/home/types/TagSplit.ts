import type { ITag } from '@/shared/types/tag/Tag';

/** O que uma tag pagou no mês e o que ainda falta pagar nela. */
export interface ITagSplit {
  tag: ITag;
  paidCents: number;
  toPayCents: number;
}
