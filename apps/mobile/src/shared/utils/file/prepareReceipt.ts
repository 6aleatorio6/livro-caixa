import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { formatFileSize } from '@/shared/utils/format/formatFileSize';
import { findReceiptAmount } from '@/shared/utils/receiptAmount/findReceiptAmount';

import { createReceiptUnreadableError } from './createReceiptUnreadableError';
import { RECEIPT_IMAGE_CONTENT_TYPES, RECEIPT_PDF_CONTENT_TYPE } from './receiptContentTypes';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { recognizeReceiptText } from './recognizeReceiptText';
import { reduceImage } from './reduceImage';

/**
 * Confere o arquivo escolhido: a imagem acima de 900 KiB passa pela redução, e o PDF vai como está, porque não há
 * como comprimi-lo. Recusa o que continua acima de 900 KiB depois disso, o limite do documento do Firestore. O que
 * passa sai com o valor pago que o OCR leu no arquivo preparado, quando leu.
 */
export async function prepareReceipt(file: ILocalFile): Promise<IReceipt> {
  const isPdf = file.contentType === RECEIPT_PDF_CONTENT_TYPE;
  const isImage = RECEIPT_IMAGE_CONTENT_TYPES.includes(file.contentType);
  if (!isPdf && !isImage) {
    throw new AppError(
      'Receipt is neither an image nor a PDF',
      'O arquivo não é uma imagem nem um PDF. Escolha outro arquivo.',
      'RECEIPT_INVALID_TYPE',
    );
  }
  if (file.sizeBytes <= 0) throw createReceiptUnreadableError();

  const prepared = isPdf ? file : await reduceImage(file);
  if (prepared.sizeBytes > RECEIPT_MAX_BYTES) {
    const limit = formatFileSize(RECEIPT_MAX_BYTES);
    throw new AppError(
      'Receipt is over 900 KiB',
      isPdf
        ? `O PDF passa de ${limit}. Escolha outro arquivo.`
        : `Mesmo comprimida, a imagem passa de ${limit}. Escolha outro arquivo.`,
      'RECEIPT_TOO_LARGE',
    );
  }

  return {
    ...prepared,
    type: isPdf ? 'pdf' : 'image',
    wasReduced: prepared.uri !== file.uri,
    readAmountCents: await findPaidAmount(prepared.uri, isPdf),
  };
}

/** O valor pago que o OCR lê no arquivo; uma falha da leitura vira `null`, porque o valor lido nunca impede o anexo. */
async function findPaidAmount(uri: string, isPdf: boolean): Promise<number | null> {
  try {
    return findReceiptAmount(await recognizeReceiptText(uri, isPdf));
  } catch {
    return null;
  }
}
