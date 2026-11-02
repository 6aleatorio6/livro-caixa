import type { IEntry } from '@/shared/types/entry/Entry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

/**
 * O lançamento como a tela o recebe: os campos do documento, sem o `createdAt`, e `tagId: null` sem tag. O tipo é o
 * do lançamento com dono, a não ser que o teste diga outro.
 */
export function entryOf<T extends IEntry = IOwnedEntry>(
  id: string,
  { createdAt: _createdAt, ...document }: Record<string, unknown>,
) {
  return { id, tagId: null, ...document } as T;
}
