import PdfPageImage from '@dariyd/react-native-pdf-page-image';
import { File } from 'expo-file-system';

import { AppError } from '@/shared/exceptions/AppError';
import type { ILocalFile } from '@/shared/types/file/LocalFile';

import { createReceiptUnreadableError } from './createReceiptUnreadableError';
import { RECEIPT_MAX_DIMENSION } from './receiptMaxDimension';

// A escala máxima da biblioteca (10 px por ponto), limitada pelo `RECEIPT_MAX_DIMENSION`: a página de qualquer
// tamanho sai com o lado maior em 2560 px.
const PAGE_SCALE = 10;

// A biblioteca só reconhece `file://` e `content://`, e lê o resto como um caminho cru. O `expo-sharing` entrega o
// arquivo compartilhado como `file:/data/...`, com uma barra só, e ela não o acharia.
function toLibraryUri(uri: string) {
  return uri.replace(/^file:\/(?!\/)/, 'file:///');
}

/**
 * Desenha a página do PDF numa imagem PNG, com o nome que a pessoa escolheu: o comprovante mora num documento do
 * Firestore, e uma imagem dá para comprimir até caber. Por enquanto, o PDF de mais de uma página é recusado
 * (`RECEIPT_PDF_MULTIPAGE`); o que não abre (corrompido, com senha) lança `RECEIPT_UNREADABLE`.
 */
export async function pdfToImage(pdf: ILocalFile): Promise<ILocalFile> {
  const uri = toLibraryUri(pdf.uri);
  let pageCount: number;
  try {
    ({ pageCount } = await PdfPageImage.open(uri));
  } catch {
    throw createReceiptUnreadableError();
  }
  if (pageCount > 1) {
    throw new AppError(
      'Receipt PDF has more than one page',
      'O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.',
      'RECEIPT_PDF_MULTIPAGE',
    );
  }
  if (pageCount < 1) throw createReceiptUnreadableError();

  try {
    // A biblioteca não roda numa thread própria nem captura falta de memória: o limite de 2560 px mantém o bitmap
    // em uns 37 MB, mesmo numa página enorme.
    const page = await PdfPageImage.generate(uri, 0, PAGE_SCALE, {
      format: 'png',
      maxDimension: RECEIPT_MAX_DIMENSION,
    });
    return { uri: page.uri, name: pdf.name, contentType: 'image/png', sizeBytes: new File(page.uri).size };
  } catch {
    throw createReceiptUnreadableError();
  }
}
