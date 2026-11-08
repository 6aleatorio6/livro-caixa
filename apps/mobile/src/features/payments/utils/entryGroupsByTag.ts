import type { ITag } from '@/shared/types/tag/Tag';

import type { IEntryTagGroup } from '../types/EntryTagGroup';
import type { IPaymentRow } from '../types/PaymentRow';

/**
 * Agrupa as linhas por tag da conta, com as tags em ordem alfabética e o grupo sem tag por último (nele também cai a
 * tag que não está na lista). O total do grupo soma o valor de cada linha. Dentro do grupo, as linhas ficam na ordem em
 * que chegaram: a das contas que o serviço do mês traz da mais recente para a mais antiga.
 */
export function entryGroupsByTag(rows: IPaymentRow[], tags: ITag[]): IEntryTagGroup[] {
  const groupsByTagId = new Map(tags.map((tag) => [tag.id, { tag, totalCents: 0, rows: [] as IPaymentRow[] }]));
  const untagged: IEntryTagGroup = { tag: null, totalCents: 0, rows: [] };
  const groupOf = (tagId: string | null) => (tagId === null ? undefined : groupsByTagId.get(tagId)) ?? untagged;

  rows.forEach((row) => {
    const group = groupOf(row.entry.tagId);
    group.totalCents += row.amountCents;
    group.rows.push(row);
  });

  const tagged = [...groupsByTagId.values()]
    .filter((group) => group.rows.length > 0)
    .sort((a, b) => a.tag.name.localeCompare(b.tag.name, 'pt-BR'));

  return untagged.rows.length > 0 ? [...tagged, untagged] : tagged;
}
