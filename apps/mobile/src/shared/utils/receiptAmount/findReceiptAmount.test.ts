import { ocrLinesOf } from '@/shared/testing/ocrLinesOf';

import { ITAU_PIX_IMAGE } from './ocrSamples/itauPixImage';
import { ITAU_PIX_PDF } from './ocrSamples/itauPixPdf';
import { MERCADO_PAGO_TRANSFER_PDF } from './ocrSamples/mercadoPagoTransferPdf';
import { NUBANK_BILL_PAYMENT_IMAGE } from './ocrSamples/nubankBillPaymentImage';
import { PICPAY_PIX_PDF } from './ocrSamples/picpayPixPdf';
import { findReceiptAmount } from './findReceiptAmount';

describe('findReceiptAmount', () => {
  // O que o ML Kit leu nos comprovantes reais, no emulador; o valor esperado é o impresso em cada um.
  describe('With the receipts read by the OCR', () => {
    it('Should read R$ 246,48 from the Nubank bill payment, whose label sits apart from the amount', () => {
      expect(findReceiptAmount(NUBANK_BILL_PAYMENT_IMAGE)).toBe(24648);
    });

    it('Should read R$ 30,00 from the Itaú Pix image', () => {
      expect(findReceiptAmount(ITAU_PIX_IMAGE)).toBe(3000);
    });

    it('Should read R$ 30,00 from the Itaú Pix PDF', () => {
      expect(findReceiptAmount(ITAU_PIX_PDF)).toBe(3000);
    });

    it('Should read R$ 30,00 from the PicPay Pix PDF', () => {
      expect(findReceiptAmount(PICPAY_PIX_PDF)).toBe(3000);
    });

    it('Should read R$ 63,96 from the Mercado Pago PDF, whose raised cents come glued to the reais', () => {
      expect(findReceiptAmount(MERCADO_PAGO_TRANSFER_PDF)).toBe(6396);
    });
  });

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

  it('Should not count a zeroed fee as a second amount', () => {
    const lines = ocrLinesOf('Comprovante de Pix', 'Valor', 'R$ 30,00', 'Tarifa', 'R$ 0,00');

    expect(findReceiptAmount(lines)).toBe(3000);
  });

  it('Should read nothing when the only amount is zero', () => {
    const lines = ocrLinesOf('Comprovante de Pix', 'Valor 30,00', 'Tarifa', 'R$ 0,00');

    expect(findReceiptAmount(lines)).toBeNull();
  });
});
