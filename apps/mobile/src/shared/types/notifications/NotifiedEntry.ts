/**
 * O lançamento que acabou de ser registrado, só com o que a notificação da família precisa. O pagamento de uma conta do
 * mês, o de uma atrasada, a conta avulsa e a contribuição se separam pelo `kind`, que é o do banco.
 */
export type INotifiedEntry =
  | {
      kind: 'recurringPayment';
      /** `{mês}_{conta}`: o id do pagamento, que o toque abre e o lembrete da conta usa para se cancelar. */
      id: string;
      /** `AAAA-MM`: o mês que a conta paga. */
      month: string;
      name: string;
      amountCents: number;
    }
  | {
      kind: 'overduePayment';
      id: string;
      /** `AAAA-MM`: o mês atrasado que a conta pagou, não o mês de hoje. */
      month: string;
      name: string;
      amountCents: number;
    }
  | { kind: 'oneOffBill'; id: string; name: string; amountCents: number }
  | {
      kind: 'contribution';
      /** O id do lançamento que recebe a contribuição: os detalhes da contribuição só abrem por Pagamentos. */
      targetId: string;
      /** `AAAA-MM`: o mês do lançamento que recebe. */
      month: string;
      /** O nome do lançamento que recebe. */
      name: string;
      amountCents: number;
    };
