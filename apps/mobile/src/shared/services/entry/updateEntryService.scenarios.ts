import {
  ANA,
  BOTH_IN_THE_LIST,
  BRUNO,
  NEW_RECEIPT,
  ONE_OFF_BILL,
  ONE_OFF_BILL_DOCUMENT,
  ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT,
  PAYMENT,
  PAYMENT_DOCUMENT,
  RECEIPT_FILE_ID,
} from '@/shared/testing/entryFixtures';
import { MISSING_RECEIPT_URI } from '@/shared/testing/contract/fixtures/receiptFixture';
import { entryOf } from '@/shared/testing/entryOf';
import { receiptOf } from '@/shared/testing/receiptOf';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

/**
 * O que o contrato confere depois do serviço, além da `result`: o documento do lançamento (`createdAt` à parte)
 * e se o comprovante foi trocado (o registro e o conteúdo antigos somem, os novos existem) ou mantido.
 */
interface IUpdateEntryExpectation {
  expectedEntry: Record<string, unknown>;
  wasReceiptReplaced: boolean;
}

const PAYMENT_SETUP = (email = BRUNO) => ({
  given: {
    ...BOTH_IN_THE_LIST,
    'entries/2026-10_electricity': PAYMENT_DOCUMENT,
    ...receiptOf(RECEIPT_FILE_ID, email).fileDocuments,
  },
  fileContentsGiven: receiptOf(RECEIPT_FILE_ID, email).fileContentIds,
});
const ONE_OFF_BILL_SETUP = (email = BRUNO) => ({
  given: {
    ...BOTH_IN_THE_LIST,
    'entries/fridge': ONE_OFF_BILL_DOCUMENT,
    ...receiptOf(RECEIPT_FILE_ID, email).fileDocuments,
  },
  fileContentsGiven: receiptOf(RECEIPT_FILE_ID, email).fileContentIds,
});
const ONE_OFF_BILL_CHANGES = { name: 'Conserto do freezer', amountCents: 40000, date: '2026-09-28', tagId: null };

export const updateEntryScenarios = {
  // O valor pago corrigido para R$ 200,00; o comprovante fica.
  memberChangesPaymentAmount: {
    signedInAs: BRUNO,
    ...PAYMENT_SETUP(),
    input: [{ entry: PAYMENT, changes: { amountCents: 20000 }, receipt: null }],
    result: undefined,
    expectedEntry: { ...PAYMENT_DOCUMENT, amountCents: 20000 },
    wasReceiptReplaced: false,
  },
  // Salvar sem mudar nada: o mesmo valor e o mesmo comprovante, e o serviço grava igual.
  memberSavesPaymentUnchanged: {
    signedInAs: BRUNO,
    ...PAYMENT_SETUP(),
    input: [{ entry: PAYMENT, changes: { amountCents: 18735 }, receipt: null }],
    result: undefined,
    expectedEntry: PAYMENT_DOCUMENT,
    wasReceiptReplaced: false,
  },
  // O mesmo valor com outro arquivo: o registro e o conteúdo antigos somem no mesmo lote.
  memberReplacesPaymentReceipt: {
    signedInAs: BRUNO,
    ...PAYMENT_SETUP(),
    input: [{ entry: PAYMENT, changes: { amountCents: 18735 }, receipt: NEW_RECEIPT }],
    result: undefined,
    expectedEntry: PAYMENT_DOCUMENT,
    wasReceiptReplaced: true,
  },
  // Nome, valor, a data em setembro (o `month` muda com ela) e a tag tirada (o campo some).
  memberChangesOneOffBill: {
    signedInAs: BRUNO,
    ...ONE_OFF_BILL_SETUP(),
    input: [{ entry: ONE_OFF_BILL, changes: ONE_OFF_BILL_CHANGES, receipt: null }],
    result: undefined,
    expectedEntry: {
      ...ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT,
      ...ONE_OFF_BILL_CHANGES,
      month: '2026-09',
      tagId: undefined,
    },
    wasReceiptReplaced: false,
  },
  memberReplacesOneOffBillReceipt: {
    signedInAs: BRUNO,
    ...ONE_OFF_BILL_SETUP(),
    input: [
      {
        entry: ONE_OFF_BILL,
        changes: { name: ONE_OFF_BILL.name, amountCents: 35000, date: '2026-10-12', tagId: ONE_OFF_BILL.tagId },
        receipt: NEW_RECEIPT,
      },
    ],
    result: undefined,
    expectedEntry: ONE_OFF_BILL_DOCUMENT,
    wasReceiptReplaced: true,
  },
  // O registro do comprovante antigo já não existe (apagado por fora): a troca ainda grava o novo e o lançamento.
  memberReplacesReceiptWithoutFileRecord: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': PAYMENT_DOCUMENT },
    input: [{ entry: PAYMENT, changes: { amountCents: 18735 }, receipt: NEW_RECEIPT }],
    result: undefined,
    expectedEntry: PAYMENT_DOCUMENT,
    wasReceiptReplaced: true,
  },
} satisfies Record<string, IServiceScenario<[IUpdateEntryInput], void> & IUpdateEntryExpectation>;

const DENIED = { code: 'ENTRY_CHANGE_DENIED', userMessage: 'Não deu para salvar as alterações.' };

/** Os casos recusados: o serviço lança `AppError`, a `result` é o que o erro carrega e nada muda. */
export const updateEntryRejectedScenarios = {
  // A avulsa é da Ana: o lote do Bruno é recusado pelas regras.
  memberChangesEntryOfAnother: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/fridge': { ...ONE_OFF_BILL_DOCUMENT, paidBy: testAccountUid(ANA) },
      ...receiptOf(RECEIPT_FILE_ID, ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf(RECEIPT_FILE_ID, ANA).fileContentIds,
    input: [
      {
        entry: entryOf('fridge', { ...ONE_OFF_BILL_DOCUMENT, paidBy: testAccountUid(ANA) }),
        changes: { name: 'Conserto da geladeira', amountCents: 99900, date: '2026-10-12', tagId: null },
        receipt: null,
      },
    ],
    result: DENIED,
  },
  // O autor salva a avulsa que a tela mostra, mas ela já foi excluída (em outro aparelho): a regra não acha o lançamento
  // para conferir o autor, e a alteração é recusada.
  memberChangesEntryDeletedMeanwhile: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: [
      {
        entry: ONE_OFF_BILL,
        changes: { name: ONE_OFF_BILL.name, amountCents: 35000, date: '2026-10-12', tagId: ONE_OFF_BILL.tagId },
        receipt: null,
      },
    ],
    result: DENIED,
  },
  // O arquivo novo sumiu do aparelho antes de salvar (o cache foi limpo): não dá para ler os bytes, e o lançamento fica
  // como estava.
  replacementReceiptUnreadable: {
    signedInAs: BRUNO,
    ...PAYMENT_SETUP(),
    input: [
      {
        entry: PAYMENT,
        changes: { amountCents: 20000 },
        receipt: { ...NEW_RECEIPT, uri: MISSING_RECEIPT_URI },
      },
    ],
    result: {
      code: 'RECEIPT_UNREADABLE',
      userMessage: 'Não deu para ler o arquivo. Escolha outro.',
    },
  },
} satisfies Record<string, IServiceScenario<[IUpdateEntryInput], { code: string; userMessage: string }>>;
