import type { ITag } from '@/shared/types/tag/Tag';

/** A tag de um lançamento ou conta; sem tag (`null`), com uma tag que não está na lista ou com a lista carregando, nada. */
export function findTag(tagId: string | null, tags: ITag[] | null | undefined) {
  return tagId === null ? undefined : tags?.find((tag) => tag.id === tagId);
}
