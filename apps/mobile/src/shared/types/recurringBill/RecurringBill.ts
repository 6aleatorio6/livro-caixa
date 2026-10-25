/**
 * Uma conta recorrente da família: o valor previsto e o dia do vencimento, a partir do mês de início.
 * Os meses não são gravados, cada um sai deste cadastro.
 */
export interface IRecurringBill {
  id: string;
  name: string;
  /** O valor previsto, em centavos; quem paga confirma ou corrige. */
  expectedAmountCents: number;
  /** De 1 a 31; num mês mais curto, a conta vence no último dia. */
  dayOfMonth: number;
  /** `AAAA-MM-DD`: um mês só tem a conta se o vencimento dele cai nesta data ou depois. */
  startsOn: string;
  /** O id da tag em `settings/tags`; `null` sem tag. */
  tagId: string | null;
}
