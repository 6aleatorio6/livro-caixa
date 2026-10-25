import { Check, Receipt } from 'lucide-react-native';

import type { IEntryMark } from '@/shared/types/entry/EntryMark';

/**
 * A marca do lançamento na lista e na folha de detalhes: o pagamento de uma conta recorrente leva o `check` em
 * `primaryContainer`; a conta avulsa, o recibo em `secondaryContainer`.
 */
export function entryMarkOf(kind: 'oneOff' | 'payment'): IEntryMark {
  return kind === 'payment'
    ? { icon: Check, markColor: 'primaryContainer', iconColor: 'onPrimaryContainer' }
    : { icon: Receipt, markColor: 'secondaryContainer', iconColor: 'onSecondaryContainer' };
}
