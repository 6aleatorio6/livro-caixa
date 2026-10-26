import { doc, getDoc, type Bytes } from '@react-native-firebase/firestore';

import { AppError } from '@/shared/exceptions/AppError';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * O comprovante para a tela abrir: os bytes de `fileContents/{fileId}`, que a regra deixa ler a todo membro, numa `uri`
 * `data:` do `contentType` do registro. Lê uma vez, sem tempo real: o conteúdo nunca muda. O conteúdo que não existe
 * lança `RECEIPT_NOT_FOUND`.
 */
export async function getReceiptContentService(fileId: string, contentType: string) {
  const snapshot = await getDoc(doc(firestoreDb, 'fileContents', fileId));
  const content = snapshot.data()?.content as Bytes | undefined;
  if (!content)
    throw new AppError('Receipt content not found', 'O comprovante não foi encontrado.', 'RECEIPT_NOT_FOUND');
  return `data:${contentType};base64,${content.toBase64()}`;
}
