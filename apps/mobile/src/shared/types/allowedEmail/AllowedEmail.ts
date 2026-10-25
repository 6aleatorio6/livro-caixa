/**
 * A pessoa da lista de e-mails permitidos: o nome que o app mostra (`null` até ela entrar pela
 * primeira vez e o app gravar o da conta Google) e se ela administra a família.
 */
export interface IAllowedEmail {
  name: string | null;
  isAdmin: boolean;
}
