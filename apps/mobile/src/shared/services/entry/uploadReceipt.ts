import { collection, doc } from '@react-native-firebase/firestore';
import { putFile, ref } from '@react-native-firebase/storage';

import { AppError } from '@/shared/exceptions/AppError';
import { firebaseStorage } from '@/shared/services/firebase/firebaseStorage';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IReceipt } from '@/shared/types/file/Receipt';

/**
 * Envia o comprovante ao Storage (`files/{id}`) e devolve a referência do registro em `files` (o `id` dela
 * é o do arquivo) e o documento dele, que quem chama grava no lote do lançamento. Se o envio falha, lança `RECEIPT_UPLOAD_FAILED`
 * e nada foi gravado.
 */
export async function uploadReceipt(receipt: IReceipt, uploadedBy: string) {
  const fileRef = doc(collection(firestoreDb, 'files'));
  const storagePath = `files/${fileRef.id}`;

  try {
    await putFile(ref(firebaseStorage, storagePath), receipt.uri, { contentType: receipt.contentType });
  } catch {
    throw new AppError(
      'Receipt upload failed',
      'Não deu para enviar o comprovante. Confira a internet e tente de novo.',
      'RECEIPT_UPLOAD_FAILED',
    );
  }

  return {
    fileRef,
    fileData: {
      storagePath,
      type: receipt.type,
      contentType: receipt.contentType,
      sizeBytes: receipt.sizeBytes,
      uploadedBy,
    },
  };
}
