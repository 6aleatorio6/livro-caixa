import type { IEntryMarkKind } from '@/shared/types/entry/EntryMarkKind';
import { entryMarkKindOf } from '@/shared/utils/entry/entryMarkKindOf';

import type { IPaymentRow } from '../types/PaymentRow';

/** A marca da linha de uma parte: as moedas na mão na contribuição; na parte de quem pagou, a da conta (recibo ou `check`). */
export function paymentRowMarkKindOf({ entry, contribution }: IPaymentRow): IEntryMarkKind {
  return contribution ? 'contribution' : entryMarkKindOf(entry);
}
