import { pluralize } from './pluralize';

/** A contagem de contas recorrentes por extenso: "Nenhuma conta recorrente", "1 conta recorrente", "5 contas recorrentes". */
export function recurringBillCount(count: number) {
  if (count === 0) {
    return 'Nenhuma conta recorrente';
  }

  return pluralize(count, 'conta recorrente', 'contas recorrentes');
}
