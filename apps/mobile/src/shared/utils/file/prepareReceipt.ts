import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { RECEIPT_IMAGE_CONTENT_TYPES, RECEIPT_PDF_CONTENT_TYPE } from './receiptContentTypes';
import { reduceImage } from './reduceImage';

const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

/** Confere o arquivo escolhido e reduz a imagem que a redução aceita; recusa o que passa de 5 MB depois disso. */
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
  if (file.sizeBytes <= 0) {
    throw new AppError('Receipt file is empty or unreadable', 'Não deu para ler o arquivo. Escolha outro.', 'RECEIPT_UNREADABLE');
  }

  const prepared = isImage ? await reduceImage(file) : file;
  if (prepared.sizeBytes > RECEIPT_MAX_BYTES) {
    throw new AppError(
      'Receipt is over 5 MB',
      isPdf ? 'O PDF passa de 5 MB. Escolha outro arquivo.' : 'A imagem passa de 5 MB. Escolha outro arquivo.',
      'RECEIPT_TOO_LARGE',
    );
  }

  return { ...prepared, type: isPdf ? 'pdf' : 'image', wasReduced: prepared.uri !== file.uri };
}
