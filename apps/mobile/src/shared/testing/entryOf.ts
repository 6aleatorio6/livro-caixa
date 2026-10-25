import type { IEntry } from '@/shared/types/entry/Entry';

/** O lançamento como a tela o recebe: os campos do documento, sem o `createdAt`, e `tagId: null` sem tag. */
export function entryOf(id: string, { createdAt: _createdAt, ...document }: Record<string, unknown>) {
  return { id, tagId: null, ...document } as IEntry;
}
