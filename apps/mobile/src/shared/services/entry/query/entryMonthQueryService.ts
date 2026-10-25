import { collection, query, where } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IEntry } from '@/shared/types/entry/Entry';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Os lançamentos de todos da família no mês (`AAAA-MM`), do mais recente para o mais antigo pela data
 * e, na mesma data, por nome; muda na hora em que alguém lança. Sem data ou sem tag, o campo chega
 * como `null`. Quem mostra só os do próprio usuário filtra pelo `paidBy`.
 */
export const entryMonthQueryService = createRealtimeService({
  refs: ({ month }: { month: string }) => [query(collection(firestoreDb, 'entries'), where('month', '==', month))],
  resolve: ([entries]): IEntry[] =>
    entries
      .map(({ id, kind, month, name, amountCents, date, tagId, paidBy }) => ({
        id,
        kind,
        month,
        name,
        amountCents,
        date: date ?? null,
        tagId: tagId ?? null,
        paidBy,
      }))
      .sort(
        (first, second) =>
          (second.date ?? '').localeCompare(first.date ?? '') || first.name.localeCompare(second.name, 'pt-BR'),
      ),
});
