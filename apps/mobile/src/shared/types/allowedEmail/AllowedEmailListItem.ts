/** Uma pessoa da lista de e-mails permitidos, como o admin a vê: o e-mail é o id do documento. */
export interface IAllowedEmailListItem {
  email: string;
  name: string;
  isAdmin: boolean;
  hasEntries: boolean;
}
