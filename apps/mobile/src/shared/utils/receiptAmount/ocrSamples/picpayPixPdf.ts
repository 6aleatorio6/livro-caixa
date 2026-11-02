import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/**
 * As linhas que o ML Kit leu no Pix do PicPay em PDF (P1), na ordem e na posição em que vieram, com os dados pessoais
 * mascarados.
 */
export const PICPAY_PIX_PDF: IOcrLine[] = [
  { text: 'PicPay', left: 145, top: 120, width: 242, height: 80 },
  { text: 'Comprovante de Pix', left: 148, top: 256, width: 537, height: 60 },
  { text: '20/out/2026 - 11:31:31', left: 148, top: 343, width: 381, height: 32 },
  { text: 'Valor', left: 146, top: 467, width: 107, height: 32 },
  { text: 'R$ 30,00', left: 150, top: 514, width: 263, height: 61 },
  { text: 'Para', left: 148, top: 663, width: 89, height: 32 },
  { text: 'NOME SOBRENOME', left: 151, top: 719, width: 555, height: 49 },
  { text: '***000.000-**', left: 148, top: 795, width: 296, height: 33 },
  { text: 'NU PAGAMENTOS - IP', left: 159, top: 857, width: 430, height: 41 },
  { text: 'De', left: 149, top: 992, width: 50, height: 31 },
  { text: 'NOME SOBRENOME', left: 150, top: 1049, width: 584, height: 40 },
  { text: '***000.000-**', left: 148, top: 1123, width: 289, height: 33 },
  { text: 'PICPAY', left: 149, top: 1191, width: 142, height: 31 },
  { text: 'ID da transação', left: 148, top: 1313, width: 323, height: 47 },
  { text: 'E22896431202610201431XXXXXXXXX', left: 149, top: 1385, width: 756, height: 33 },
  { text: 'XX', left: 148, top: 1434, width: 50, height: 31 },
  { text: 'Dados bancários do', left: 149, top: 1609, width: 409, height: 33 },
  { text: 'recebedor', left: 148, top: 1658, width: 211, height: 32 },
  { text: 'AG 0000 CC 000000000', left: 147, top: 1726, width: 521, height: 32 },
  { text: 'PicPay Instituição de Pagamento S.A', left: 149, top: 2322, width: 608, height: 40 },
  { text: 'CNPJ n° 22.896.431/0001-10.', left: 147, top: 2389, width: 472, height: 35 },
  { text: 'Ouvidoria:', left: 904, top: 2278, width: 165, height: 27 },
  { text: '0800 025 2000 (dias úteis de 09h às 18h)', left: 904, top: 2326, width: 699, height: 32 },
  { text: 'SAC: 0800 025 8000', left: 904, top: 2376, width: 356, height: 26 },
  { text: 'Canais de atendimento emn libras:', left: 904, top: 2424, width: 557, height: 27 },
  { text: 'pessoalize.callvideo.io/picpay', left: 905, top: 2468, width: 486, height: 38 },
];
