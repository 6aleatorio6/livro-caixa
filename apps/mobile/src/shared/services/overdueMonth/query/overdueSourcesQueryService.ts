import { collection, query, where } from '@react-native-firebase/firestore';

import { FIRST_MONTH } from '@/shared/constants/date/firstMonth';
import { toOverdueMonth } from '@/shared/services/overdueMonth/query/toOverdueMonth';
import { toEntry } from '@/shared/services/entry/query/toEntry';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';
import type { IEntry } from '@/shared/types/entry/Entry';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * O que decide quais contas estão atrasadas: os lançamentos e os meses de conta (pagos depois ou pulados) de todos os
 * meses desde o primeiro do app até o anterior ao atual (`AAAA-MM`), cada lista do mês mais antigo ao mais novo; muda
 * na hora em que alguém lança, paga depois ou pula. Cada consulta filtra um campo só, o `month`, e não pede índice
 * composto. Um `kind` ou `status` que o app não conhece fica de fora. Sem o mês atual (`null`: a tela mostra outro mês),
 * a leitura fica parada.
 */
export const overdueSourcesQueryService = createRealtimeService({
  refs: ({ currentMonth }: { currentMonth: string | null }) =>
    currentMonth
      ? [
          query(
            collection(firestoreDb, 'entries'),
            where('month', '>=', FIRST_MONTH),
            where('month', '<', currentMonth),
          ),
          query(
            collection(firestoreDb, 'overdueMonths'),
            where('month', '>=', FIRST_MONTH),
            where('month', '<', currentMonth),
          ),
        ]
      : [],
  // Sem o mês atual, `resolve` não roda: a leitura parada não entrega nada.
  resolve: ([entries = [], overdueMonths = []]): { entries: IEntry[]; overdueMonths: IOverdueMonth[] } => ({
    entries: entries.flatMap((document) => toEntry(document) ?? []),
    overdueMonths: overdueMonths.flatMap((document) => toOverdueMonth(document) ?? []),
  }),
});
