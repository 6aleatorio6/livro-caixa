import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { formatFileSize } from '@/shared/utils/format/formatFileSize';

import { createReceiptUnreadableError } from './createReceiptUnreadableError';
import { pdfToImage } from './pdfToImage';
import { RECEIPT_IMAGE_CONTENT_TYPES, RECEIPT_PDF_CONTENT_TYPE } from './receiptContentTypes';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { reduceImage } from './reduceImage';

/**
 * Confere o arquivo escolhido e devolve a imagem que vai para o comprovante: o PDF vira a imagem da página (`pdfToImage`),
 * e a imagem acima de 900 KiB passa pela redução. Recusa o que continua acima de 900 KiB depois disso.
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

  const image = isPdf ? await pdfToImage(file) : file;
  const prepared = await reduceImage(image);
  if (prepared.sizeBytes > RECEIPT_MAX_BYTES) {
    throw new AppError(
      'Receipt is over 900 KiB',
      `Mesmo comprimida, a imagem passa de ${formatFileSize(RECEIPT_MAX_BYTES)}. Escolha outro arquivo.`,
      'RECEIPT_TOO_LARGE',
    );
  }

  return { ...prepared, type: 'image', wasReduced: prepared.uri !== file.uri };
}
