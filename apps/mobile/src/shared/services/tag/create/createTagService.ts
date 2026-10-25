import { collection, doc, runTransaction } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import { saveTagInTransaction } from '@/shared/services/tag/saveTagInTransaction';
import type { ITag } from '@/shared/types/tag/Tag';
import { tagNameKey } from '@/shared/utils/tag/tagNameKey';

/**
 * Qualquer membro cria uma tag. O id nasce aqui, e o nome é conferido numa transação: se outro item
 * tem a mesma chave de nome, lança `AppError` com o código `TAG_NAME_IN_USE`. Cria o documento
 * `settings/tags` se ele ainda não existe. Não apara: quem chama apara. Devolve a tag gravada.
 */
export function createTagService({ name, color }: Pick<ITag, 'name' | 'color'>): Promise<ITag> {
  const tag: ITag = { id: doc(collection(firestoreDb, 'settings')).id, name, nameKey: tagNameKey(name), color };
  return runTransaction(firestoreDb, async (transaction) => {
    await saveTagInTransaction(transaction, tag);
    return tag;
  });
}
