import { collection, query, where } from '@react-native-firebase/firestore';

import { FIRST_MONTH } from '@/shared/constants/date/firstMonth';
import { toBillMonth } from '@/shared/services/billMonth/query/toBillMonth';
import { toEntry } from '@/shared/services/entry/query/toEntry';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import type { IEntry } from '@/shared/types/entry/Entry';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * O que decide quais contas estão atrasadas: os lançamentos e os meses de conta (pagos depois ou pulados) de todos os
 * meses desde o primeiro do app até o anterior ao atual (`AAAA-MM`), cada lista do mês mais antigo ao mais novo; muda
 * na hora em que alguém lança, paga depois ou pula. Cada consulta filtra um campo só, o `month`, e não pede índice
 * composto. Um `kind` ou `status` que o app não conhece fica de fora.
 */
export const overdueSourcesQueryService = createRealtimeService({
  refs: ({ currentMonth }: { currentMonth: string }) => [
    query(collection(firestoreDb, 'entries'), where('month', '>=', FIRST_MONTH), where('month', '<', currentMonth)),
    query(collection(firestoreDb, 'billMonths'), where('month', '>=', FIRST_MONTH), where('month', '<', currentMonth)),
  ],
  resolve: ([entries, billMonths]): { entries: IEntry[]; billMonths: IBillMonth[] } => ({
    entries: entries.flatMap((document) => toEntry(document) ?? []),
    billMonths: billMonths.flatMap((document) => toBillMonth(document) ?? []),
  }),
});
