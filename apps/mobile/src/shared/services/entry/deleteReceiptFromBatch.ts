import { doc, type WriteBatch } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/** Põe no lote a exclusão do registro e do conteúdo do comprovante `fileId`, que as regras só aceitam juntos. */
export function deleteReceiptFromBatch(batch: WriteBatch, fileId: string) {
  batch.delete(doc(firestoreDb, 'files', fileId));
  batch.delete(doc(firestoreDb, 'fileContents', fileId));
}
