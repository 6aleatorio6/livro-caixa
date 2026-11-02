import { Check, Receipt, UsersRound } from 'lucide-react-native';

import type { IEntryMark } from '@/shared/types/entry/EntryMark';

/**
 * A marca do lançamento na lista e na folha de detalhes: o pagamento de uma conta recorrente leva o `check` em
 * `primaryContainer`; a conta paga só pelas contribuições, as pessoas (`users-round`) na mesma cor; a conta avulsa, o
 * recibo em `secondaryContainer`.
 */
export function entryMarkOf(kind: 'oneOff' | 'payment' | 'contributions'): IEntryMark {
  if (kind === 'oneOff') return { icon: Receipt, markColor: 'secondaryContainer', iconColor: 'onSecondaryContainer' };

  return { icon: kind === 'payment' ? Check : UsersRound, markColor: 'primaryContainer', iconColor: 'onPrimaryContainer' };
}
