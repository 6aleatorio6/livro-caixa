import { collection, query, where } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * Os `tagId` das contas avulsas, um por conta (repetidos se várias usam a mesma tag), sem as contas
 * sem tag: é o que conta o "em uso" das tags.
 */
export const oneOffBillTagIdsQueryService = createRealtimeService({
  refs: () => [query(collection(firestoreDb, 'entries'), where('kind', '==', 'oneOffBill'))],
  resolve: ([entries]): string[] => entries.flatMap(({ tagId }) => (tagId ? [tagId] : [])),
});
