import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/**
 * As linhas que o ML Kit leu no Pix do Itaú em PDF, com a página desenhada (I1, PDF), na ordem e na posição em que
 * vieram, com os dados pessoais mascarados.
 */
export const ITAU_PIX_PDF: IOcrLine[] = [
  { text: 'itaŭ', left: 93, top: 188, width: 73, height: 34 },
  { text: 'Comprovante de Pix', left: 66, top: 317, width: 312, height: 39 },
  { text: 'R$ 30,00', left: 81, top: 379, width: 163, height: 53 },
  { text: 'De', left: 66, top: 595, width: 33, height: 22 },
  { text: 'Realizado em 20/10/2026 às 08:22:10', left: 139, top: 468, width: 505, height: 26 },
  { text: 'NOME SOBRENOME', left: 66, top: 644, width: 311, height: 21 },
  { text: 'CPF: ***000.000-**', left: 66, top: 695, width: 228, height: 20 },
  { text: 'Instituição: ITAÚ UNIBANCO S.A', left: 67, top: 737, width: 382, height: 30 },
  { text: 'Para', left: 67, top: 855, width: 56, height: 21 },
  { text: 'NOME SOBRENOME', left: 66, top: 901, width: 244, height: 27 },
  { text: 'CPF: ***000000**', left: 66, top: 954, width: 200, height: 19 },
  { text: 'Instituição: PICPAY INSTITUIÇão DE PAGAMENTO S.A.', left: 67, top: 1002, width: 636, height: 26 },
  { text: 'Chave Pix: +55000000 00000', left: 66, top: 1050, width: 344, height: 20 },
  { text: 'Dados da transação', left: 66, top: 1162, width: 254, height: 29 },
  { text: 'Autenticação:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX XXXXX', left: 66, top: 1213, width: 794, height: 25 },
  { text: 'ID da transação: E60701190202610201120XXXXXXXXXXX', left: 67, top: 1261, width: 708, height: 25 },
  { text: 'Realizada em: Celular', left: 67, top: 1310, width: 258, height: 21 },
  { text: 'Central de atendimento', left: 66, top: 1396, width: 307, height: 23 },
  { text: 'Capitais e regiões metropolitanas: 4004 4828', left: 66, top: 1448, width: 552, height: 26 },
  { text: 'Demais localidades: 0800 970 4828', left: 67, top: 1496, width: 425, height: 20 },
  { text: 'SAC 24 horas: 0800 728 0728', left: 66, top: 1545, width: 352, height: 20 },
  { text: 'Ouvidoria (dias úteis das 9h às 18h): 0800 570 0011', left: 66, top: 1593, width: 624, height: 24 },
  { text: 'Canal para PcD auditiva ou de fala: 0800 722 1722', left: 66, top: 1642, width: 608, height: 24 },
  { text: '1 de 1', left: 1625, top: 102, width: 70, height: 20 },
];
