import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

/** Os primeiros nomes de várias pessoas, sem repetir, como numa frase: "Bruno", "Bruno e Carla", "Ana, Bruno e Carla". */
export function memberNamesOf(uids: string[], people: IAllowedEmailListItem[]) {
  const names = [...new Set(uids)].map((uid) => memberNameOf(uid, people));
  const last = names.pop() ?? '';

  return names.length > 0 ? `${names.join(', ')} e ${last}` : last;
}
