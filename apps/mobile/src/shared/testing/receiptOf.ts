import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { testAccountUid } from '@/shared/testing/testAccountUid';

/**
 * O documento de `files`, o id do conteúdo em `fileContents` (o `fileContentsGiven` do cenário) e o objeto do Storage
 * de um comprovante enviado por `email`.
 */
export function receiptOf(fileId: string, email: string) {
  const uploadedBy = testAccountUid(email);
  return {
    fileDocuments: {
      [`files/${fileId}`]: {
        name: 'comprovante-antigo.png',
        storagePath: `files/${fileId}`,
        type: 'image',
        contentType: 'image/png',
        sizeBytes: RECEIPT_FIXTURE.sizeBytes,
        uploadedBy,
      },
    },
    fileContentIds: [fileId],
    storageObjects: { [`files/${fileId}`]: { contentType: 'image/png', uploadedBy } },
  };
}
