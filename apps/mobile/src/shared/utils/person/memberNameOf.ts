import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { displayNameOf } from '@/shared/utils/person/displayNameOf';
import { firstNameOf } from '@/shared/utils/person/firstNameOf';

/** O primeiro nome atual de quem pagou, da lista de pessoas (o e-mail inteiro, se ela ainda não tem nome); quem não está mais nela é "Alguém". */
export function memberNameOf(uid: string, people: IAllowedEmailListItem[]) {
  const person = people.find((candidate) => candidate.uid === uid);

  return person ? firstNameOf(displayNameOf(person)) : 'Alguém';
}
