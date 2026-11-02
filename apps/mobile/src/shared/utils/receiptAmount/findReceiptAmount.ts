import { MAX_AMOUNT_CENTS } from '@/shared/constants/maxAmountCents';
import type { IOcrLine } from '@/shared/types/ocr/OcrLine';
import type { IReceiptParser } from '@/shared/types/receiptAmount/ReceiptParser';

import { mercadoPagoReceiptParser } from './mercadoPagoReceiptParser';
import { singleAmountReceiptParser } from './singleAmountReceiptParser';

// Os específicos primeiro; o de um valor só aceita qualquer comprovante e fecha a lista. O específico que não acha o
// valor no formato dele (o OCR leu a vírgula dos centavos do Mercado Pago) passa a vez ao próximo, e o valor acima do
// teto do campo (dígitos que o OCR colou) não vale.
const RECEIPT_PARSERS: IReceiptParser[] = [mercadoPagoReceiptParser, singleAmountReceiptParser];

/** O valor pago, em centavos, que as linhas lidas no comprovante mostram; `null` quando não há um valor sem dúvida. */
export function findReceiptAmount(lines: IOcrLine[]): number | null {
  for (const parser of RECEIPT_PARSERS) {
    const amountCents = parser.matches(lines) ? parser.findAmountCents(lines) : null;
    if (amountCents !== null && amountCents <= MAX_AMOUNT_CENTS) return amountCents;
  }
  return null;
}
