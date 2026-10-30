import type { IOcrLine } from '@/shared/types/ocr/OcrLine';
import type { IReceiptParser } from '@/shared/types/receiptAmount/ReceiptParser';

import { singleAmountReceiptParser } from './singleAmountReceiptParser';

// Os específicos primeiro; o de um valor só aceita qualquer comprovante e fecha a lista.
const RECEIPT_PARSERS: IReceiptParser[] = [singleAmountReceiptParser];

/** O valor pago, em centavos, que as linhas lidas no comprovante mostram; `null` quando não há um valor sem dúvida. */
export function findReceiptAmount(lines: IOcrLine[]): number | null {
  const parser = RECEIPT_PARSERS.find((candidate) => candidate.matches(lines));
  return parser ? parser.findAmountCents(lines) : null;
}
