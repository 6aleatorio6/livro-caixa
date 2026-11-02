import { Check, HandCoins, Receipt, UsersRound } from 'lucide-react-native';

import type { IEntryMark } from '@/shared/types/entry/EntryMark';
import type { IEntryMarkKind } from '@/shared/types/entry/EntryMarkKind';

const ICON_BY_KIND = { payment: Check, paidByContributions: UsersRound, contribution: HandCoins } as const;

/**
 * A marca do lançamento na lista e na folha de detalhes: a conta avulsa leva o recibo em `secondaryContainer`; os
 * outros, `primaryContainer`, com o `check` no pagamento, as pessoas (`users-round`) na conta paga só pelas
 * contribuições e as moedas na mão (`hand-coins`) na contribuição.
 */
export function entryMarkOf(kind: IEntryMarkKind): IEntryMark {
  if (kind === 'oneOff') return { icon: Receipt, markColor: 'secondaryContainer', iconColor: 'onSecondaryContainer' };

  return { icon: ICON_BY_KIND[kind], markColor: 'primaryContainer', iconColor: 'onPrimaryContainer' };
}
