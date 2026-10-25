import type { ITag } from '@/shared/types/tag/Tag';

/** O nome da tag de um lançamento ou conta; sem tag (`null`) ou com uma tag que não está na lista, nada. */
export function tagNameOf(tagId: string | null, tags: ITag[] | null | undefined) {
  return tagId === null ? undefined : tags?.find((tag) => tag.id === tagId)?.name;
}
