import { ANA, BOTH_IN_THE_LIST, BRUNO, RECEIPT_FILE_ID } from '@/shared/testing/entryFixtures';
import { receiptOf } from '@/shared/testing/receiptOf';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// O registro grava também o `uploadedBy`, que a tela não lê.
const IMAGE_FILE = {
  name: 'recibo-conserto.jpg',
  type: 'image',
  contentType: 'image/jpeg',
  sizeBytes: 120000,
  uploadedBy: testAccountUid(BRUNO),
} as const;
// O PDF de uma página chega como a imagem da página, com o nome que a pessoa escolheu.
const CONVERTED_PDF_FILE = {
  name: 'comprovante-luz.pdf',
  type: 'image',
  contentType: 'image/png',
  sizeBytes: 90000,
  uploadedBy: testAccountUid(BRUNO),
} as const;

const toReceiptFile = (id: string, { uploadedBy: _uploadedBy, ...file }: Record<string, unknown>) =>
  ({ id, ...file }) as IReceiptFile;

// O comprovante que os cenários de alterar e excluir guardam para o Bruno.
const RECEIPT_TO_CHANGE_FILE = receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments[`files/${RECEIPT_FILE_ID}`];

export const receiptFileQueryScenarios = {
  // A Ana lê o registro do comprovante que o Bruno enviou.
  imageReceipt: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, [`files/${RECEIPT_FILE_ID}`]: IMAGE_FILE },
    input: { id: RECEIPT_FILE_ID },
    result: toReceiptFile(RECEIPT_FILE_ID, IMAGE_FILE),
  },
  convertedPdfReceipt: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, [`files/${RECEIPT_FILE_ID}`]: CONVERTED_PDF_FILE },
    input: { id: RECEIPT_FILE_ID },
    result: toReceiptFile(RECEIPT_FILE_ID, CONVERTED_PDF_FILE),
  },
  // O Bruno lê o registro do comprovante dos próprios lançamentos que as telas de alterar abrem.
  receiptToChange: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, [`files/${RECEIPT_FILE_ID}`]: RECEIPT_TO_CHANGE_FILE },
    input: { id: RECEIPT_FILE_ID },
    result: toReceiptFile(RECEIPT_FILE_ID, RECEIPT_TO_CHANGE_FILE),
  },
  // Sem registro (um lançamento antigo, ou o registro apagado), a leitura entrega `null`.
  missingReceiptFile: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: { id: RECEIPT_FILE_ID },
    result: null,
  },
} satisfies Record<string, IServiceScenario<{ id: string | null }, IReceiptFile | null>>;
