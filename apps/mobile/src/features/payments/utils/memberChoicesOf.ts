import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

import type { IMemberChoice } from '../types/MemberChoice';

/**
 * Os chips de Pagamentos: "Todos" primeiro, depois "Você" e quem já entrou no app, pelo primeiro nome. Quem foi
 * adicionado e nunca entrou fica de fora: sem `uid`, não tem lançamento.
 */
export function memberChoicesOf(people: IAllowedEmailListItem[], uid: string): IMemberChoice[] {
  const others = people
    .filter((person): person is IAllowedEmailListItem & { uid: string } => person.uid !== null && person.uid !== uid)
    .map((person): IMemberChoice => memberChoice(person.uid, memberNameOf(person.uid, people)))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return [{ kind: 'everyone', key: 'everyone', name: 'Todos' }, memberChoice(uid, 'Você'), ...others];
}

function memberChoice(uid: string, name: string): IMemberChoice {
  return { kind: 'member', key: uid, uid, name };
}
