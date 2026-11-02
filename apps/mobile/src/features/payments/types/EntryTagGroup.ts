import type { ITag } from '@/shared/types/tag/Tag';

import type { IPaymentRow } from './PaymentRow';

/** As contas de uma tag e o total delas na lista; `tag: null` é o grupo do que não tem tag. */
export interface IEntryTagGroup {
  tag: ITag | null;
  totalCents: number;
  rows: IPaymentRow[];
}
