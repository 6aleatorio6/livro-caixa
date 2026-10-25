/**
 * O que o formulário da conta recorrente guarda. O dia fica como texto, que é o que o campo edita;
 * `recurringBillInputOf` o converte em inteiro.
 */
export interface IRecurringBillFormValues {
  name: string;
  /** O valor previsto, em centavos; `null` é o campo vazio. */
  amountCents: number | null;
  dayOfMonth: string;
  /** `AAAA-MM-DD`. */
  startsOn: string;
  /** O id da tag escolhida; `null` sem tag. */
  tagId: string | null;
}
