import {
  ANA,
  BOTH_IN_THE_LIST,
  BRUNO,
  ONE_OFF_BILL,
  ONE_OFF_BILL_DOCUMENT,
  PAYMENT,
  PAYMENT_DOCUMENT,
  RECEIPT_FILE_ID,
} from '@/shared/testing/entryFixtures';
import { entryOf } from '@/shared/testing/entryOf';
import { receiptOf } from '@/shared/testing/receiptOf';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

export const deleteEntryScenarios = {
  // O pagamento, o registro do comprovante e o objeto somem, e o mês deixa de trazê-lo. As telas excluem o lançamento
  // que a leitura por id entregou, que é este `entry`.
  memberDeletesPayment: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': PAYMENT_DOCUMENT, ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments },
    storageGiven: receiptOf(RECEIPT_FILE_ID, BRUNO).storageObjects,
    input: [PAYMENT],
    result: undefined,
  },
  memberDeletesOneOffBill: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_DOCUMENT, ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments },
    storageGiven: receiptOf(RECEIPT_FILE_ID, BRUNO).storageObjects,
    input: [ONE_OFF_BILL],
    result: undefined,
  },
  // O objeto não está no Storage (um envio antigo que sobrou sem arquivo): a exclusão termina sem erro.
  memberDeletesEntryWithMissingObject: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_DOCUMENT, ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments },
    input: [ONE_OFF_BILL],
    result: undefined,
  },
  // O registro do comprovante já não existe (apagado por fora): o lote ainda exclui o lançamento.
  memberDeletesEntryWithoutFileRecord: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_DOCUMENT },
    input: [ONE_OFF_BILL],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IEntry], void>>;

/** Os casos recusados: o serviço lança `AppError`, a `result` é o que o erro carrega e nada muda. */
export const deleteEntryRejectedScenarios = {
  // A avulsa é da Ana: o lote do Bruno é recusado, e o lançamento, o registro e o objeto ficam.
  memberDeletesEntryOfAnother: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/fridge': { ...ONE_OFF_BILL_DOCUMENT, paidBy: testAccountUid(ANA) },
      ...receiptOf(RECEIPT_FILE_ID, ANA).fileDocuments,
    },
    storageGiven: receiptOf(RECEIPT_FILE_ID, ANA).storageObjects,
    input: [entryOf('fridge', { ...ONE_OFF_BILL_DOCUMENT, paidBy: testAccountUid(ANA) })],
    result: { code: 'ENTRY_DELETE_DENIED', userMessage: 'Não deu para excluir o lançamento.' },
  },
  // O autor exclui o pagamento que a folha mostra, mas ele já foi excluído (em outro aparelho): o lote não acha o lançamento
  // para a regra conferir o autor, é recusado, e nada muda.
  memberDeletesEntryDeletedMeanwhile: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: [PAYMENT],
    result: { code: 'ENTRY_DELETE_DENIED', userMessage: 'Não deu para excluir o lançamento.' },
  },
} satisfies Record<string, IServiceScenario<[IEntry], { code: string; userMessage: string }>>;
