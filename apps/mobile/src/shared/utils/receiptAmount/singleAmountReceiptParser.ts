import type { IReceiptParser } from '@/shared/types/receiptAmount/ReceiptParser';

import { findBrlAmounts } from './findBrlAmounts';

/**
 * O parser de qualquer comprovante, o último da lista: o valor pago é o único valor em reais do texto, mesmo que
 * apareça mais de uma vez. Com valores diferentes (o do documento e o pago com juros), não há como escolher. O valor
 * zerado (a tarifa ou os juros de R$ 0,00) não conta: não é o pago, e o formulário recusa o zero.
 */
export const singleAmountReceiptParser: IReceiptParser = {
  matches: () => true,
  findAmountCents(lines) {
    const amounts = findBrlAmounts(lines.map((line) => line.text).join('\n'));
    const paidAmounts = new Set(amounts.filter((amountCents) => amountCents > 0));
    return paidAmounts.size === 1 ? [...paidAmounts][0] : null;
  },
};
