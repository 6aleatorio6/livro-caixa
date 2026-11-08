import { requireOptionalNativeModule } from 'expo';

import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/** O módulo nativo de `modules/receipt-ocr`. */
interface IReceiptOcrModule {
  recognizeText(uri: string, isPdf: boolean, pageIndex: number): Promise<IOcrLine[] | null>;
}

/**
 * As linhas de texto que o ML Kit lê numa página do comprovante: a imagem é uma página só, e o PDF tem a página
 * `pageIndex` desenhada. Nulo quando o PDF não tem essa página, quando a leitura falha ou quando o binário do app é
 * anterior ao módulo do OCR, porque o valor lido nunca impede o anexo. Quem lê página por página para no primeiro nulo.
 */
export async function recognizeReceiptText(uri: string, isPdf: boolean, pageIndex: number): Promise<IOcrLine[] | null> {
  const receiptOcr = requireOptionalNativeModule<IReceiptOcrModule>('ReceiptOcr');
  if (!receiptOcr) return null;
  try {
    return await receiptOcr.recognizeText(uri, isPdf, pageIndex);
  } catch {
    return null;
  }
}
