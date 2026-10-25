/** Uma pessoa da lista de e-mails permitidos, como o admin a vê: o e-mail é o id do documento. */
export interface IAllowedEmailListItem {
  email: string;
  /** `null` enquanto a pessoa não entrou: o nome vem da conta Google na primeira entrada. */
  name: string | null;
  /** O `uid` do login, gravado na primeira entrada; `null` até a pessoa entrar. */
  uid: string | null;
  isAdmin: boolean;
  hasEntries: boolean;
}
