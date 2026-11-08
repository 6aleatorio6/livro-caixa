import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

import type { IMemberChoice } from '../types/MemberChoice';

/**
 * Os chips de Pagamentos: "Você" primeiro, depois quem já entrou no app, pelo primeiro nome. Quem foi adicionado e
 * nunca entrou fica de fora: sem `uid`, não tem lançamento.
 */
export function memberChoicesOf(people: IAllowedEmailListItem[], uid: string): IMemberChoice[] {
  const others = people
    .filter((person): person is IAllowedEmailListItem & { uid: string } => person.uid !== null && person.uid !== uid)
    .map((person): IMemberChoice => ({ uid: person.uid, name: memberNameOf(person.uid, people) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return [{ uid, name: 'Você' }, ...others];
}
