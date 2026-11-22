import type { IAllowedEmailDocument } from '@/shared/types/allowedEmail/AllowedEmailDocument';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

/** Uma pessoa da lista de e-mails permitidos a partir do documento: o `id` vira o e-mail e o que falta vira `null`. */
export function allowedEmailListItemOf({
  id,
  name,
  uid,
  isAdmin,
  hasEntries,
}: IAllowedEmailDocument): IAllowedEmailListItem {
  return { email: id, name: name ?? null, uid: uid ?? null, isAdmin, hasEntries };
}
