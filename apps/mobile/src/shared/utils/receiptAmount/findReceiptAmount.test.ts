import { ocrLinesOf } from '@/shared/testing/ocrLinesOf';

import { findReceiptAmount } from './findReceiptAmount';

describe('findReceiptAmount', () => {
  it('Should read the amount once when the receipt repeats it', () => {
    const lines = ocrLinesOf('Comprovante de Pix', 'Valor', 'R$ 30,00', 'Para', 'NOME SOBRENOME', 'Total', 'R$ 30,00');

    expect(findReceiptAmount(lines)).toBe(3000);
  });

  it('Should read nothing from lines without an amount', () => {
    const lines = ocrLinesOf('Comprovante de pagamento', 'Agência 0001', 'Conta 00000000-0', '16 SET 2026 - 12:29:59');

    expect(findReceiptAmount(lines)).toBeNull();
  });

  it('Should read nothing when the receipt shows two different amounts', () => {
    const lines = ocrLinesOf('Pagamento de boleto', 'Valor do documento', 'R$ 100,00', 'Valor pago', 'R$ 102,00');

    expect(findReceiptAmount(lines)).toBeNull();
  });
});
