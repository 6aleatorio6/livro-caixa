import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { joinNames } from '@/shared/utils/format/joinNames';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

/** Os primeiros nomes de várias pessoas, sem repetir, como numa frase: "Bruno", "Bruno e Carla", "Ana, Bruno e Carla". */
export function memberNamesOf(uids: string[], people: IAllowedEmailListItem[]) {
  return joinNames([...new Set(uids)].map((uid) => memberNameOf(uid, people)));
}
