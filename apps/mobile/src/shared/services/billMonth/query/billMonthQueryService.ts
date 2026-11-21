import { collection, query, where, type DocumentData } from '@react-native-firebase/firestore';

import { toBillMonth } from '@/shared/services/billMonth/query/toBillMonth';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Os meses de conta pagos depois ou pulados do mês (`AAAA-MM`), do primeiro registrado ao último; muda na hora em que
 * alguém paga ou pula um. O que o servidor ainda não carimbou é o mais novo, e a ordem é feita aqui para a consulta
 * não pedir índice composto. Um `status` que o app não conhece fica de fora.
 */
export const billMonthQueryService = createRealtimeService({
  // Sem o mês (a tela ainda espera o que o diz), a leitura fica parada.
  refs: ({ month }: { month: string | null }) =>
    month ? [query(collection(firestoreDb, 'billMonths'), where('month', '==', month))] : [],
  // Sem o mês, `resolve` não roda: a leitura parada não entrega nada.
  resolve: ([billMonths = []]): IBillMonth[] =>
    [...billMonths]
      .sort(
        (first, second) => createdAtMillisOf(first) - createdAtMillisOf(second) || first.id.localeCompare(second.id),
      )
      .flatMap((document) => {
        const billMonth = toBillMonth(document);
        return billMonth ? [billMonth] : [];
      }),
});

// O `createdAt` que o servidor ainda não carimbou é o mais novo: `Infinity` o põe por último.
function createdAtMillisOf(document: DocumentData): number {
  return document.createdAt?.toMillis() ?? Infinity;
}
