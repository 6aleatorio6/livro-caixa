/**
 * A contribuição de um membro num lançamento de outro, ou num mês de conta recorrente ainda a pagar. Não tem nome,
 * data nem tag: vêm do lançamento que ela recebe (`entryId`), que chega na mesma leitura do mês.
 */
export interface IContributionEntry {
  id: string;
  kind: 'contribution';
  /** `AAAA-MM`: o mês do lançamento que ela recebe. */
  month: string;
  /** O id do lançamento que ela recebe: o pagamento do mês, com dono ou sem, ou a conta avulsa. */
  entryId: string;
  /** O valor contribuído, em centavos. */
  amountCents: number;
  /** O uid de quem contribuiu. */
  paidBy: string;
  /** O id do registro do comprovante em `files`. */
  receiptFileId: string;
  /** `AAAA-MM-DD` em que a contribuição foi registrada. */
  paidOn: string;
}
