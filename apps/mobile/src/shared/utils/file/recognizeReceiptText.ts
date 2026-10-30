import { requireOptionalNativeModule } from 'expo';

import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/** O módulo nativo de `modules/receipt-ocr`. */
interface IReceiptOcrModule {
  recognizeText(uri: string, isPdf: boolean): Promise<IOcrLine[]>;
}

/**
 * As linhas de texto que o ML Kit lê no comprovante: na imagem, ou na primeira página do PDF. Nenhuma quando a leitura
 * falha ou quando o binário do app é anterior ao módulo do OCR, porque o valor lido nunca impede o anexo.
 */
export async function recognizeReceiptText(uri: string, isPdf: boolean): Promise<IOcrLine[]> {
  const receiptOcr = requireOptionalNativeModule<IReceiptOcrModule>('ReceiptOcr');
  if (!receiptOcr) return [];
  try {
    return await receiptOcr.recognizeText(uri, isPdf);
  } catch {
    return [];
  }
}
