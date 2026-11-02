import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/**
 * As linhas que o ML Kit leu na transferência por Pix do Mercado Pago em PDF, só imagem (M1), na ordem e na posição em
 * que vieram, com os dados pessoais mascarados.
 */
export const MERCADO_PAGO_TRANSFER_PDF: IOcrLine[] = [
  { text: 'mercado', left: 264, top: 57, width: 283, height: 56 },
  { text: 'pago', left: 264, top: 123, width: 153, height: 60 },
  { text: 'Comprovante de transferência', left: 62, top: 274, width: 983, height: 72 },
  { text: '16/outubro/2026 às 3:06:57.', left: 62, top: 377, width: 683, height: 45 },
  { text: 'R$ 6396', left: 92, top: 622, width: 334, height: 101 },
  { text: 'Origem e destino', left: 61, top: 943, width: 348, height: 47 },
  { text: 'NOME SOBRENOME', left: 176, top: 1015, width: 491, height: 50 },
  { text: 'CPF: ***000.000-**', left: 155, top: 1094, width: 420, height: 32 },
  { text: 'Mercado Pago', left: 155, top: 1154, width: 297, height: 47 },
  { text: 'Número da conta: 00000000000', left: 156, top: 1224, width: 664, height: 35 },
  { text: 'm NOME SOBRENOME', left: 70, top: 1372, width: 597, height: 47 },
  { text: 'CPF: ***,000.000-**', left: 155, top: 1445, width: 420, height: 32 },
  { text: 'NU PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENT', left: 156, top: 1504, width: 1123, height: 46 },
  { text: 'Número da conta: 000000000', left: 156, top: 1575, width: 622, height: 34 },
  { text: 'N.° de operação de Mercado Pago', left: 86, top: 1822, width: 688, height: 42 },
  { text: '00000000-0000-0000-0000-000000000000', left: 62, top: 1892, width: 1091, height: 40 },
  { text: 'ID de transação Pix', left: 62, top: 2052, width: 395, height: 41 },
  { text: 'E18236120202610160606XXXXXXXXXXX', left: 62, top: 2119, width: 1023, height: 38 },
];
