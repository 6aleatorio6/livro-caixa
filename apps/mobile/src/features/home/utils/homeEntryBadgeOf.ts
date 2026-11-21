import type { IBadgeProps } from '@/shared/components/Badge/Badge';
import type { IBillEntry } from '@/shared/types/entry/BillEntry';

import { fromMonthLabelOf } from './fromMonthLabelOf';

/**
 * O selo da linha de uma conta paga no Início: o pagamento de uma conta atrasada diz de que mês era a conta, em cinza
 * ("De outubro"), porque a conta já está paga; as outras linhas não têm selo.
 */
export function homeEntryBadgeOf(entry: IBillEntry): IBadgeProps | undefined {
  if (entry.kind !== 'overduePayment') return undefined;

  return { label: fromMonthLabelOf(entry.billMonth), background: 'surfaceContainerHigh', color: 'onSurfaceVariant' };
}
