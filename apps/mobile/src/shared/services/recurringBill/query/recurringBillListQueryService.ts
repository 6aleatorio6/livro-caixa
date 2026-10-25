import { collection } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Todas as contas recorrentes, em ordem de dia do vencimento e, no mesmo dia, de nome; muda na hora
 * em que alguém adiciona, altera ou exclui uma. A coleção é pequena e lida inteira. A conta sem tag
 * não tem o campo `tagId`: chega como `null`.
 */
export const recurringBillListQueryService = createRealtimeService({
  refs: () => [collection(firestoreDb, 'recurringBills')],
  resolve: ([recurringBills]): IRecurringBill[] =>
    recurringBills
      .map(({ id, name, expectedAmountCents, dayOfMonth, startsOn, tagId }) => ({
        id,
        name,
        expectedAmountCents,
        dayOfMonth,
        startsOn,
        tagId: tagId ?? null,
      }))
      .sort(
        (first, second) => first.dayOfMonth - second.dayOfMonth || first.name.localeCompare(second.name, 'pt-BR'),
      ),
});
