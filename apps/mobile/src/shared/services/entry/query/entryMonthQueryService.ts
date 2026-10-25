import { collection, query, where } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IEntry } from '@/shared/types/entry/Entry';
import { compareNewestFirst } from '@/shared/utils/entry/compareNewestFirst';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Os lançamentos de todos da família no mês (`AAAA-MM`), do mais recente para o mais antigo pela data
 * e, na mesma data, o lançado por último primeiro (o que o servidor ainda não carimbou é o mais novo); muda
 * na hora em que alguém lança. O pagamento de uma conta recorrente chega sem data, e uma conta sem tag, com `tagId` `null`. Quem mostra só os do próprio
 * usuário filtra pelo `paidBy`.
 */
export const entryMonthQueryService = createRealtimeService({
  refs: ({ month }: { month: string }) => [query(collection(firestoreDb, 'entries'), where('month', '==', month))],
  resolve: ([entries]): IEntry[] =>
    [...entries].sort(compareNewestFirst).map(({ id, kind, month, name, amountCents, date, recurringBillId, tagId, paidBy }) => {
      const common = { id, month, name, amountCents, tagId: tagId ?? null, paidBy };
      return kind === 'recurringPayment'
        ? { ...common, kind, recurringBillId, date: null }
        : { ...common, kind: 'oneOffBill', date };
    }),
});
