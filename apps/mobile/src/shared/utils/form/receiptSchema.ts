import { mixed } from 'yup';

import type { IReceiptFormContext } from '@/shared/types/form/ReceiptFormContext';
import type { IReceipt } from '@/shared/types/file/Receipt';

/** O campo do comprovante dos formulários de lançamento: obrigatório, a menos que a alteração já tenha um salvo. */
export function receiptSchema() {
  return mixed<IReceipt>()
    .nullable()
    .defined()
    .test('filled', 'Anexe o comprovante.', function (value) {
      // Ao alterar o lançamento, manter o comprovante que já tem é não escolher outro.
      const { hasCurrentReceipt = false } = (this.options.context as Partial<IReceiptFormContext> | undefined) ?? {};
      return value !== null || hasCurrentReceipt;
    });
}
