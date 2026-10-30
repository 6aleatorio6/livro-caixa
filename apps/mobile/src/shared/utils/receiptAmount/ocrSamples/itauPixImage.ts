import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/**
 * As linhas que o ML Kit leu no Pix do Itaú em imagem (I1, PNG), na ordem e na posição em que vieram, com os dados
 * pessoais mascarados.
 */
export const ITAU_PIX_IMAGE: IOcrLine[] = [
  { text: 'itaű', left: 73, top: 132, width: 66, height: 32 },
  { text: 'Comprovante de Pix', left: 49, top: 253, width: 288, height: 32 },
  { text: 'R$ 30,00', left: 64, top: 318, width: 168, height: 47 },
  { text: 'De', left: 50, top: 524, width: 36, height: 22 },
  { text: 'Realizado em 20/10/2026 às 08:22:10', left: 126, top: 425, width: 461, height: 23 },
  { text: 'NOME SOBRENOME', left: 50, top: 571, width: 340, height: 23 },
  { text: 'CPF: *** 000.000-**', left: 49, top: 617, width: 234, height: 25 },
  { text: 'Instituição: ITAÚ UNIBANCO S.A', left: 50, top: 663, width: 386, height: 32 },
  { text: 'Para', left: 50, top: 764, width: 61, height: 22 },
  { text: 'NOME SOBRENOME', left: 50, top: 811, width: 274, height: 29 },
  { text: 'CPF: ***000000**', left: 49, top: 861, width: 206, height: 20 },
  { text: 'Instituição: PICPAY INSTITUIÇão DE PAGAMENTO S.A.', left: 50, top: 908, width: 647, height: 27 },
  { text: 'Chave Pix: +5500000000000', left: 49, top: 956, width: 349, height: 20 },
  { text: 'Dados da transação', left: 49, top: 1046, width: 284, height: 34 },
  { text: 'Autenticação:', left: 49, top: 1100, width: 169, height: 28 },
  { text: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', left: 50, top: 1141, width: 633, height: 19 },
  { text: 'ID da transação:', left: 49, top: 1185, width: 197, height: 29 },
  { text: 'E60701190202610201120XXXXXXXXXXX', left: 50, top: 1229, width: 513, height: 19 },
  { text: 'Realizada em: Celular', left: 50, top: 1275, width: 263, height: 21 },
  { text: 'Central de atendimento', left: 41, top: 1373, width: 252, height: 17 },
  { text: 'Capitais e regiões metropolitanas: 4004 4828', left: 41, top: 1409, width: 401, height: 19 },
  { text: 'Demais localidades: 0800 970 4828', left: 41, top: 1445, width: 310, height: 15 },
  { text: 'SAC 24 horas: 0800 728 0728', left: 41, top: 1481, width: 255, height: 15 },
  { text: 'Ouvidoria (dias úteis das 9h às 18h): 0800 570 0011', left: 41, top: 1516, width: 454, height: 18 },
  { text: 'Canal para PcD auditiva ou de fala: 0800 722 1722', left: 41, top: 1553, width: 441, height: 17 },
];
