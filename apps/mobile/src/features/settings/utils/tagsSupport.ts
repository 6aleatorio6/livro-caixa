import type { ITag } from '@/shared/types/tag/Tag';

/** O apoio da linha "Tags": os nomes na ordem da lista, "Casa, Saúde"; sem tags, "Nenhuma tag". */
export function tagsSupport(tags: ITag[]) {
  if (tags.length === 0) {
    return 'Nenhuma tag';
  }

  return tags.map((tag) => tag.name).join(', ');
}
