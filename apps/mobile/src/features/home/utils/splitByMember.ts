import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IMemberPart } from '@/shared/types/entry/MemberPart';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

import type { IMemberSplit } from '../types/MemberSplit';

/**
 * Divide o pago do mês por pessoa, pelas partes de cada uma (o valor pago menos as contribuições, e as contribuições),
 * do maior para o menor. O nome é o primeiro nome atual, da lista de pessoas (não o do lançamento); quem não está mais
 * na lista aparece como "Alguém".
 */
export function splitByMember(parts: IMemberPart[], people: IAllowedEmailListItem[]): IMemberSplit[] {
  const totals = new Map<string, number>();
  parts.forEach(({ uid, amountCents }) => totals.set(uid, (totals.get(uid) ?? 0) + amountCents));

  return [...totals.entries()]
    .map(([uid, paidCents]) => ({ uid, name: memberNameOf(uid, people), paidCents }))
    .sort((a, b) => b.paidCents - a.paidCents || a.name.localeCompare(b.name));
}
