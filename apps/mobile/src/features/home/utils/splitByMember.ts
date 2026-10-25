import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IEntry } from '@/shared/types/entry/Entry';
import { displayNameOf } from '@/shared/utils/person/displayNameOf';

import type { IMemberSplit } from '../types/MemberSplit';

/**
 * Divide o pago do mês por pessoa, do maior para o menor. O nome é o primeiro nome atual, da lista de pessoas (não o
 * do lançamento); quem não está mais na lista aparece como "Alguém".
 */
export function splitByMember(paid: IEntry[], people: IAllowedEmailListItem[]): IMemberSplit[] {
  const totals = new Map<string, number>();
  paid.forEach((entry) => totals.set(entry.paidBy, (totals.get(entry.paidBy) ?? 0) + entry.amountCents));

  return [...totals.entries()]
    .map(([uid, paidCents]) => {
      const person = people.find((candidate) => candidate.uid === uid);
      return { uid, name: person ? displayNameOf(person) : 'Alguém', paidCents };
    })
    .sort((a, b) => b.paidCents - a.paidCents || a.name.localeCompare(b.name));
}
