import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IOcrLine } from '@/shared/types/ocr/OcrLine';
import { formatFileSize } from '@/shared/utils/format/formatFileSize';
import { findBrlAmounts } from '@/shared/utils/receiptAmount/findBrlAmounts';
import { findReceiptAmount } from '@/shared/utils/receiptAmount/findReceiptAmount';

import { createReceiptUnreadableError } from './createReceiptUnreadableError';
import { RECEIPT_IMAGE_CONTENT_TYPES, RECEIPT_PDF_CONTENT_TYPE } from './receiptContentTypes';
import { RECEIPT_MAX_BYTES } from './receiptMaxBytes';
import { recognizeReceiptText } from './recognizeReceiptText';
import { reduceImage } from './reduceImage';

// O comprovante de um banco pode trazer os valores só na segunda página, e a terceira cobre uma capa ou os termos
// antes deles. Mais que isso não compensa: cada página lida custa o desenho dela e uma passada do ML Kit.
const MAX_OCR_PAGES = 3;

// O ML Kit pode não responder, e a leitura não pode prender o anexo. O prazo vale para a leitura inteira, não por
// página: três páginas lentas fariam o membro esperar 24 s por um valor que ele ainda confere.
const OCR_DEADLINE_MS = 8000;

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

  const deadlineAt = Date.now() + OCR_DEADLINE_MS;
  return {
    ...prepared,
    type: isPdf ? 'pdf' : 'image',
    wasReduced: prepared.uri !== file.uri,
    readAmountCents: await resultWithinDeadline(findPaidAmount(prepared.uri, isPdf, deadlineAt)),
  };
}

/** O resultado da leitura, ou `null` quando ela não termina no prazo; o temporizador sai quando ela termina antes. */
async function resultWithinDeadline(reading: Promise<number | null>): Promise<number | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      // Sem o aviso, um módulo nativo que sempre trava passaria por comprovante sem valor.
      console.warn(`A leitura do comprovante passou de ${OCR_DEADLINE_MS / 1000} s e segue sem o valor lido.`);
      resolve(null);
    }, OCR_DEADLINE_MS);
  });
  try {
    return await Promise.race([reading, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

async function findPaidAmount(uri: string, isPdf: boolean, deadlineAt: number): Promise<number | null> {
  const pagesToRead = isPdf ? MAX_OCR_PAGES : 1;
  try {
    for (let pageIndex = 0; pageIndex < pagesToRead; pageIndex += 1) {
      // A chamada nativa já em andamento não se cancela, mas as páginas seguintes não valem o trabalho: ninguém
      // espera mais pelo resultado.
      if (Date.now() >= deadlineAt) return null;
      // Em sequência de propósito: a página seguinte só é lida quando esta não mostra valor.
      const lines = await recognizeReceiptText(uri, isPdf, pageIndex);
      if (lines === null) return null;
      const amountCents = findReceiptAmount(lines);
      if (amountCents !== null) return amountCents;
      // Com dois valores diferentes (o pago e uma tarifa), nada é preenchido: a página seguinte traria só um deles.
      if (showsAmount(lines)) return null;
    }
    return null;
  } catch {
    // O valor lido nunca impede o anexo.
    return null;
  }
}

/** Se a página mostra algum valor em reais acima de zero, mesmo sem um que dê para escolher como o pago. */
function showsAmount(lines: IOcrLine[]): boolean {
  return findBrlAmounts(lines.map((line) => line.text).join('\n')).some((amountCents) => amountCents > 0);
}
