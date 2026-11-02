import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/** Um tipo de comprovante: sabe se as linhas lidas são dele e onde fica o valor pago nelas. */
export interface IReceiptParser {
  /** Diz se as linhas são deste tipo de comprovante, pelo texto próprio do banco. */
  matches(lines: IOcrLine[]): boolean;
  /** O valor pago em centavos, ou `null` quando não há um valor sem dúvida. */
  findAmountCents(lines: IOcrLine[]): number | null;
}
