import type { IEntry } from '@/shared/types/entry/Entry';
import type { ITag } from '@/shared/types/tag/Tag';

import type { IEntryTagGroup } from '../types/EntryTagGroup';

/**
 * Agrupa os lançamentos por tag, com as tags em ordem alfabética e o grupo sem tag por último (nele também cai a tag
 * que não está na lista). Dentro do grupo, os lançamentos ficam na ordem em que chegaram: o serviço do mês já os traz
 * do mais recente para o mais antigo.
 */
export function entryGroupsByTag(entries: IEntry[], tags: ITag[]): IEntryTagGroup[] {
  const groupsByTagId = new Map(tags.map((tag) => [tag.id, { tag, totalCents: 0, entries: [] as IEntry[] }]));
  const untagged: IEntryTagGroup = { tag: null, totalCents: 0, entries: [] };
  const groupOf = (tagId: string | null) => (tagId === null ? undefined : groupsByTagId.get(tagId)) ?? untagged;

  entries.forEach((entry) => {
    const group = groupOf(entry.tagId);
    group.totalCents += entry.amountCents;
    group.entries.push(entry);
  });

  const tagged = [...groupsByTagId.values()]
    .filter((group) => group.entries.length > 0)
    .sort((a, b) => a.tag.name.localeCompare(b.tag.name, 'pt-BR'));

  return untagged.entries.length > 0 ? [...tagged, untagged] : tagged;
}
