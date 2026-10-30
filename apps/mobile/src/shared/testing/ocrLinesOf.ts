import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/** As linhas na ordem da leitura, uma embaixo da outra, como o OCR as devolve; nenhum parser lê a posição. */
export function ocrLinesOf(...texts: string[]): IOcrLine[] {
  return texts.map((text, index) => ({ text, left: 40, top: 100 + index * 60, width: 400, height: 40 }));
}
