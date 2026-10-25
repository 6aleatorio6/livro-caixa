import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana e Bruno estão na lista.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const BOTH_IN_THE_LIST = {
  [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

// O registro grava também o `uploadedBy` e o `contentType`, que a tela não lê.
const IMAGE_FILE = {
  name: 'recibo-conserto.jpg',
  storagePath: 'files/f-fridge',
  type: 'image',
  contentType: 'image/jpeg',
  sizeBytes: 120000,
  uploadedBy: testAccountUid(ANA),
} as const;
const PDF_FILE = {
  name: 'comprovante-luz.pdf',
  storagePath: 'files/f-electricity',
  type: 'pdf',
  contentType: 'application/pdf',
  sizeBytes: 90000,
  uploadedBy: testAccountUid(ANA),
} as const;

const toReceiptFile = (
  id: string,
  { uploadedBy: _uploadedBy, contentType: _contentType, ...file }: Record<string, unknown>,
) => ({ id, ...file }) as IReceiptFile;

export const receiptFileQueryScenarios = {
  // O Bruno lê o registro do comprovante que a Ana enviou.
  imageReceipt: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'files/f-fridge': IMAGE_FILE },
    input: { id: 'f-fridge' },
    result: toReceiptFile('f-fridge', IMAGE_FILE),
  },
  pdfReceipt: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'files/f-electricity': PDF_FILE },
    input: { id: 'f-electricity' },
    result: toReceiptFile('f-electricity', PDF_FILE),
  },
  // Sem registro (um lançamento antigo, ou o registro apagado), a leitura entrega `null`.
  missingReceiptFile: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: { id: 'f-fridge' },
    result: null,
  },
} satisfies Record<string, IServiceScenario<{ id: string | null }, IReceiptFile | null>>;
