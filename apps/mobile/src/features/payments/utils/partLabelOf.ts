import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IMemberPart } from '@/shared/types/entry/MemberPart';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

/**
 * Como cada parte se chama embaixo da conta, no chip de um membro: a dele, "Sua parte" no chip de quem está logado
 * (ou o nome) e "· contribuição" quando é uma; a dos outros, "Ana · pagou a conta" ou "Bruno · contribuição".
 */
export function partLabelOf(
  { uid, contribution }: IMemberPart,
  people: IAllowedEmailListItem[],
  chosenUid: string,
  signedInUid: string | null,
) {
  // "Sua parte" só no chip de quem está logado: no de outro membro, cada parte vai pelo nome, a dele também.
  const name = uid === chosenUid && uid === signedInUid ? 'Sua parte' : memberNameOf(uid, people);
  if (contribution) return `${name} · contribuição`;
  return uid === chosenUid ? name : `${name} · pagou a conta`;
}
