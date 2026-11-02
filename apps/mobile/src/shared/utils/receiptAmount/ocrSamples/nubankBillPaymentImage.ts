import type { IOcrLine } from '@/shared/types/ocr/OcrLine';

/**
 * As linhas que o ML Kit leu no pagamento de conta de luz do Nubank, em imagem (N1), na ordem e na posição em que
 * vieram, com os dados pessoais mascarados.
 */
export const NUBANK_BILL_PAYMENT_IMAGE: IOcrLine[] = [
  { text: 'Comprovante de', left: 22, top: 83, width: 237, height: 29 },
  { text: 'pagamento', left: 22, top: 124, width: 156, height: 28 },
  { text: '16 SET 2026 - 12:29:59', left: 22, top: 167, width: 212, height: 15 },
  { text: 'Valor', left: 21, top: 227, width: 43, height: 13 },
  { text: 'Pagador', left: 22, top: 279, width: 69, height: 16 },
  { text: 'Agência', left: 21, top: 327, width: 66, height: 19 },
  { text: 'Conta', left: 22, top: 382, width: 49, height: 13 },
  { text: 'Documento', left: 22, top: 458, width: 86, height: 12 },
  { text: 'Favorecido', left: 22, top: 505, width: 92, height: 14 },
  { text: 'Código de barras', left: 22, top: 556, width: 145, height: 18 },
  { text: 'XXXXXXXXXXXXXXX', left: 22, top: 610, width: 136, height: 12 },
  { text: 'ID da transação:', left: 22, top: 759, width: 135, height: 16 },
  { text: 'Nu Pagamentos S.A.', left: 22, top: 688, width: 171, height: 16 },
  { text: 'CNPJ 18.236.120/0001-58', left: 22, top: 714, width: 229, height: 15 },
  { text: 'R$ 246,48', left: 253, top: 222, width: 83, height: 22 },
  { text: 'NOME SOBRENOME', left: 169, top: 278, width: 169, height: 15 },
  { text: '836400000029464800XXXXXXXXXXXXXXX', left: 22, top: 587, width: 308, height: 11 },
  { text: '000000000000', left: 21, top: 806, width: 123, height: 14 },
  { text: '00000000-0', left: 231, top: 382, width: 107, height: 13 },
  { text: '00000000-0000-0000-0000-', left: 30, top: 779, width: 243, height: 19 },
  { text: 'Me ajuda →', left: 22, top: 901, width: 81, height: 18 },
  { text: '0001', left: 296, top: 327, width: 39, height: 18 },
  { text: 'EDP SP', left: 280, top: 502, width: 56, height: 17 },
  { text: 'Estamos aqui para ajudar se você tiver', left: 22, top: 835, width: 284, height: 15 },
  { text: 'alguma dúvida.', left: 22, top: 855, width: 110, height: 19 },
  { text: 'Ouvidoria: 0800 887 0463 ou demais', left: 22, top: 952, width: 278, height: 13 },
  { text: 'canais em nubank.com.br/', left: 21, top: 976, width: 198, height: 15 },
  { text: 'contatos#ouvidoria (Atendimento das 8h', left: 22, top: 1000, width: 301, height: 14 },
  { text: 'às 18h em dias úteis).', left: 22, top: 1023, width: 152, height: 15 },
];
