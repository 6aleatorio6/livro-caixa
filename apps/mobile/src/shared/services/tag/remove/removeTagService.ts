import type { ITag } from '@/shared/types/tag/Tag';

import { deleteField, updateDoc } from '@react-native-firebase/firestore';

import { tagsRef } from '@/shared/services/tag/tagsRef';

/**
 * Qualquer membro exclui uma tag: apaga só o item dela do mapa `items`, e o documento fica, mesmo
 * vazio. Quem chama confere antes que nenhuma conta recorrente usa a tag. O id é a chave gerada pelo
 * Firestore, sem pontos, então serve de caminho do campo.
 */
export function removeTagService({ id }: Pick<ITag, 'id'>) {
  return updateDoc(tagsRef(), { [`items.${id}`]: deleteField() });
}
