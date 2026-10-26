import { AppError } from '@/shared/exceptions/AppError';

/** O comprovante que não dá para ler: vazio, corrompido, com senha, ou que sumiu do aparelho antes de salvar. */
export function createReceiptUnreadableError() {
  return new AppError(
    'Receipt file could not be read',
    'Não deu para ler o arquivo. Escolha outro.',
    'RECEIPT_UNREADABLE',
  );
}
