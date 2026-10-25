import type { Transaction } from '@react-native-firebase/firestore';

import { tagsRef } from '@/shared/services/tag/tagsRef';
import { AppError } from '@/shared/exceptions/AppError';
import type { ITag } from '@/shared/types/tag/Tag';

/**
 * Dentro de uma transação, lê `settings/tags`, recusa o nome que outro item já tem (a chave do nome,
 * sem diferença de maiúsculas e acentos) e grava o item. Quem renomeia a própria tag só muda a caixa
 * e passa: o item dela não conta. O `merge` cria o documento no primeiro item e deixa os outros como estão.
 * Na alteração (`isUpdate`), o item precisa estar lá: se outro membro excluiu a tag no meio do caminho,
 * lança `TAG_NOT_FOUND` em vez de recriá-la.
 */
export async function saveTagInTransaction(transaction: Transaction, tag: ITag, { isUpdate = false } = {}) {
  const snapshot = await transaction.get(tagsRef());
  const items: Record<string, Omit<ITag, 'id'>> = snapshot.exists() ? (snapshot.data().items ?? {}) : {};

  if (isUpdate && !items[tag.id]) {
    throw new AppError(`Tag ${tag.id} not found`, 'Esta tag foi excluída.', 'TAG_NOT_FOUND');
  }

  const sameName = Object.entries(items).find(([id, item]) => id !== tag.id && item.nameKey === tag.nameKey);
  if (sameName) {
    throw new AppError(
      `Tag name already in use by the tag ${sameName[0]}`,
      `Já existe a tag ${sameName[1].name}. Escolha outro nome.`,
      'TAG_NAME_IN_USE',
    );
  }

  const { id, ...item } = tag;
  transaction.set(tagsRef(), { items: { [id]: item } }, { merge: true });
}
