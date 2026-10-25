import { Bytes, collection, doc, type WriteBatch } from '@react-native-firebase/firestore';
import { File } from 'expo-file-system';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { createReceiptUnreadableError } from '@/shared/utils/file/createReceiptUnreadableError';

/**
 * Lê os bytes do comprovante e põe no lote do lançamento o registro em `files/{id}` e o conteúdo em
 * `fileContents/{id}`, que as regras só aceitam juntos; devolve o `id`, o `receiptFileId` do lançamento. Nada é
 * gravado aqui. Se o arquivo do aparelho não pode ser lido (o cache foi limpo), lança `RECEIPT_UNREADABLE`.
 */
export async function addReceiptToBatch(batch: WriteBatch, receipt: IReceipt, uploadedBy: string) {
  const file = new File(receipt.uri);
  let base64: string;
  try {
    base64 = await file.base64();
  } catch {
    throw createReceiptUnreadableError();
  }

  const fileRef = doc(collection(firestoreDb, 'files'));
  batch.set(fileRef, {
    name: receipt.name,
    type: receipt.type,
    contentType: receipt.contentType,
    // A regra exige o tamanho exato do conteúdo, e o que o seletor ou o compartilhamento informam pode não ser: o do
    // disco é o dos bytes lidos.
    sizeBytes: file.size,
    uploadedBy,
  });
  batch.set(doc(firestoreDb, 'fileContents', fileRef.id), { content: Bytes.fromBase64String(base64) });
  return fileRef.id;
}
