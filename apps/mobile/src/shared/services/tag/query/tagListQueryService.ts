import { TAG_COLORS } from '@/shared/constants/tag/tagColors';
import { tagsRef } from '@/shared/services/tag/tagsRef';
import type { ITag } from '@/shared/types/tag/Tag';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/** Um item de `settings/tags` com a forma de uma tag: a regra não olha dentro dos itens, e um membro pode gravar outra coisa pelo SDK. */
function isTagItem(item: unknown): item is Omit<ITag, 'id'> {
  if (typeof item !== 'object' || item === null) return false;
  const { name, nameKey, color } = item as Record<string, unknown>;
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    typeof nameKey === 'string' &&
    TAG_COLORS.some((option) => option.color === color)
  );
}

/**
 * Todas as tags da família, em ordem de nome (pt-BR); muda na hora em que alguém cria, renomeia ou
 * exclui uma. Sem o documento `settings/tags` ainda, a lista é vazia, e um item fora da forma é
 * descartado, para não derrubar as telas de todos.
 */
export const tagListQueryService = createRealtimeService({
  refs: () => [tagsRef()],
  resolve: ([settings]): ITag[] =>
    Object.entries((settings?.items ?? {}) as Record<string, unknown>)
      .flatMap(([id, item]) => (isTagItem(item) ? [{ id, name: item.name, nameKey: item.nameKey, color: item.color }] : []))
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR')),
});
