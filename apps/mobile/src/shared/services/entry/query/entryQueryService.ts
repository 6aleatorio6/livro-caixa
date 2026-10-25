import { doc } from '@react-native-firebase/firestore';

import { toEntry } from '@/shared/services/entry/query/toEntry';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IEntry } from '@/shared/types/entry/Entry';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Um lançamento da família pelo id, em tempo real, no mesmo formato da lista do mês. O lançamento que
 * não existe (ou foi excluído com a leitura aberta) chega como `null`.
 */
export const entryQueryService = createRealtimeService({
  refs: ({ id }: { id: string }) => [doc(firestoreDb, 'entries', id)],
  resolve: ([entry]): IEntry | null => (entry ? toEntry(entry) : null),
});
