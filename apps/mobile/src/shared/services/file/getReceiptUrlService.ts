import { getDownloadURL, ref } from '@react-native-firebase/storage';

import { AppError } from '@/shared/exceptions/AppError';
import { firebaseStorage } from '@/shared/services/firebase/firebaseStorage';

/**
 * O endereço para abrir o comprovante guardado no Storage (`files/{id}`), que a regra deixa ler a todo
 * membro. O objeto que não existe lança `RECEIPT_NOT_FOUND`.
 */
export async function getReceiptUrlService(storagePath: string) {
  try {
    return await getDownloadURL(ref(firebaseStorage, storagePath));
  } catch (error) {
    if ((error as { code?: string }).code === 'storage/object-not-found') {
      throw new AppError('Receipt object not found', 'O comprovante não foi encontrado.', 'RECEIPT_NOT_FOUND');
    }
    throw error;
  }
}
