import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

/** Uma pessoa da lista que já entrou no app, para os testes de unidade: o uid e o nome que eles citam. */
export function personOf(uid: string, name: string): IAllowedEmailListItem {
  return { email: `${uid}@example.com`, name, uid, isAdmin: false, hasEntries: true };
}
