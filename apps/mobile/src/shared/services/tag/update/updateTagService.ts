import { runTransaction } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import { saveTagInTransaction } from '@/shared/services/tag/saveTagInTransaction';
import type { ITag } from '@/shared/types/tag/Tag';
import { tagNameKey } from '@/shared/utils/tag/tagNameKey';

/**
 * Qualquer membro renomeia a tag ou troca a cor dela. O nome é conferido na mesma transação da
 * criação: outro item com a mesma chave de nome lança `AppError` com o código `TAG_NAME_IN_USE`, mas
 * a própria tag pode mudar só a caixa ("Casa" para "CASA"). Se a tag foi excluída no meio do caminho,
 * lança `AppError` com o código `TAG_NOT_FOUND`, em vez de recriá-la. Não apara: quem chama apara. Devolve a tag gravada.
 */
export function updateTagService({ id, name, color }: Pick<ITag, 'id' | 'name' | 'color'>): Promise<ITag> {
  const tag: ITag = { id, name, nameKey: tagNameKey(name), color };
  return runTransaction(firestoreDb, async (transaction) => {
    await saveTagInTransaction(transaction, tag, { isUpdate: true });
    return tag;
  });
}
