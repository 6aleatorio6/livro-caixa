import { collection, query, where, type DocumentData } from '@react-native-firebase/firestore';

import { toOverdueMonth } from '@/shared/services/overdueMonth/query/toOverdueMonth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Os meses de conta pagos depois ou pulados do mês (`AAAA-MM`), do primeiro registrado ao último; muda na hora em que
 * alguém paga ou pula um. O que o servidor ainda não carimbou é o mais novo, e a ordem é feita aqui para a consulta
 * não pedir índice composto. Um `status` que o app não conhece fica de fora.
 */
export const overdueMonthQueryService = createRealtimeService({
  // Sem o mês (a tela ainda espera o que o diz), a leitura fica parada.
  refs: ({ month }: { month: string | null }) =>
    month ? [query(collection(firestoreDb, 'overdueMonths'), where('month', '==', month))] : [],
  // Sem o mês, `resolve` não roda: a leitura parada não entrega nada.
  resolve: ([overdueMonths = []]): IOverdueMonth[] =>
    [...overdueMonths]
      .sort(
        (first, second) => createdAtMillisOf(first) - createdAtMillisOf(second) || first.id.localeCompare(second.id),
      )
      .flatMap((document) => {
        const overdueMonth = toOverdueMonth(document);
        return overdueMonth ? [overdueMonth] : [];
      }),
});

// O `createdAt` que o servidor ainda não carimbou é o mais novo: `Infinity` o põe por último.
function createdAtMillisOf(document: DocumentData): number {
  return document.createdAt?.toMillis() ?? Infinity;
}
