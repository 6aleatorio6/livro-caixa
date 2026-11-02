import type { IReceiptParser } from '@/shared/types/receiptAmount/ReceiptParser';

import { brlCents } from './brlCents';

// O título escreve os centavos sobrescritos, sem vírgula: o OCR lê `R$ 6396`, ou `R$ 63 96`.
const RAISED_CENTS_AMOUNT = /^R\$\s*(\d{1,3}(?:\.\d{3})+|\d+?)\s?(\d{2})$/;

/**
 * A transferência do Mercado Pago, reconhecida pelo número de operação: o nome sozinho também aparece como a outra
 * parte no comprovante de outro banco. O valor é o título, com os dois últimos dígitos nos centavos.
 */
export const mercadoPagoReceiptParser: IReceiptParser = {
  matches: (lines) => lines.some((line) => line.text.includes('operação de Mercado Pago')),
  findAmountCents(lines) {
    const match = lines.map((line) => RAISED_CENTS_AMOUNT.exec(line.text.trim())).find(Boolean);
    return match ? brlCents(match[1], match[2]) : null;
  },
};
