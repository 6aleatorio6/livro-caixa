import type { IEntry } from '@/shared/types/entry/Entry';
import type { IMemberPart } from '@/shared/types/entry/MemberPart';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';

/**
 * A parte de cada membro em cada conta dos lançamentos: quem pagou fica com o valor pago menos as contribuições, e
 * cada contribuinte com a sua. O pagamento sem dono não dá parte a ninguém; a contribuição cujo lançamento não está
 * na lista também não conta.
 *
 * A ordem é garantida: as contas na ordem recebida e, em cada uma, a parte de quem pagou primeiro e depois as
 * contribuições, da mais antiga para a mais nova.
 */
export function memberPartsOf(entries: IEntry[]): IMemberPart[] {
  return entries.flatMap((entry): IMemberPart[] => {
    if (entry.kind === 'contribution') return [];
    const contributions = contributionsOf(entry.id, entries);
    const contributorParts = contributions.map((contribution) => ({
      entry,
      uid: contribution.paidBy,
      amountCents: contribution.amountCents,
      contribution,
    }));
    if (entry.paidBy === null) return contributorParts;

    return [
      { entry, uid: entry.paidBy, amountCents: entry.amountCents - sumCents(contributions), contribution: null },
      ...contributorParts,
    ];
  });
}
