import { collection, query, where } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IEntry } from '@/shared/types/entry/Entry';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';
import { compareNewestFirst } from '@/shared/utils/entry/compareNewestFirst';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Os lançamentos de todos da família no mês (`AAAA-MM`), do mais recente para o mais antigo pela data
 * e, na mesma data, o lançado por último primeiro (o que o servidor ainda não carimbou é o mais novo); muda
 * na hora em que alguém lança. O pagamento de uma conta recorrente chega sem data e com o `paidOn`, o dia em que foi registrado, e uma conta sem tag, com `tagId` `null`. Quem mostra só os do próprio
 * usuário filtra pelo `paidBy`.
 */
export const entryMonthQueryService = createRealtimeService({
  refs: ({ month }: { month: string }) => [query(collection(firestoreDb, 'entries'), where('month', '==', month))],
  resolve: ([entries]): IEntry[] =>
    entries
      .map((entry) => Object.assign({}, entry, { paidOn: toIsoDate(entry.createdAt?.toDate() ?? new Date()) }))
      .sort(compareNewestFirst)
      .map(({ id, kind, month, name, amountCents, date, recurringBillId, dueDay, expectedAmountCents, tagId, paidBy, paidOn }) => {
        const common = { id, month, name, amountCents, tagId: tagId ?? null, paidBy };
        return kind === 'recurringPayment'
          ? { ...common, kind, recurringBillId, dueDay, expectedAmountCents, date: null, paidOn }
          : { ...common, kind: 'oneOffBill', date };
      }),
});
