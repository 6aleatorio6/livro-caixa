import { doc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * O registro do comprovante (`files/{id}`) em tempo real; `null` se ele não existe. Com `id` `null` (o
 * lançamento ainda não chegou), a leitura fica parada.
 */
export const receiptFileQueryService = createRealtimeService({
  refs: ({ id }: { id: string | null }) => (id ? [doc(firestoreDb, 'files', id)] : []),
  resolve: ([file]): IReceiptFile | null =>
    file
      ? {
          id: file.id,
          name: file.name,
          type: file.type,
          sizeBytes: file.sizeBytes,
          storagePath: file.storagePath,
        }
      : null,
});
