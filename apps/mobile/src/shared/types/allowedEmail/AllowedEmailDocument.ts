/** Um documento de `allowedEmails` como o `snapshotData` o entrega: o e-mail vem no `id`, e `name` e `uid` podem faltar. */
export interface IAllowedEmailDocument {
  id: string;
  name?: string | null;
  uid?: string | null;
  isAdmin: boolean;
  hasEntries: boolean;
}
