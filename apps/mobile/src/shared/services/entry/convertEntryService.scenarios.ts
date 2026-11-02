import {
  ANA,
  BOTH_IN_THE_LIST,
  BRUNO,
  CONTRIBUTION,
  CONTRIBUTION_DOCUMENT,
  CONTRIBUTION_FILE_ID,
  CONTRIBUTION_TO_UNOWNED,
  CONTRIBUTION_TO_UNOWNED_DOCUMENT,
  NEW_RECEIPT,
  PAYMENT,
  PAYMENT_DOCUMENT,
  RECEIPT_FILE_ID,
  UNOWNED_PAYMENT_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import { receiptOf } from '@/shared/testing/receiptOf';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IConvertEntryInput } from '@/shared/types/entry/ConvertEntryInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

/**
 * O que o contrato confere depois do serviço: os lançamentos que ficam, sem o `createdAt` (o id gerado da contribuição
 * nova vale qualquer texto), e se o comprovante foi trocado.
 */
interface IConvertEntryExpectation {
  expectedEntries: Record<string, unknown>[];
  wasReceiptReplaced: boolean;
}

const omitCreatedAt = ({ createdAt: _createdAt, ...document }: Record<string, unknown>) => document;

const INTERNET_WITH_ANA = {
  given: {
    ...BOTH_IN_THE_LIST,
    'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
    'entries/c-ana': CONTRIBUTION_TO_UNOWNED_DOCUMENT,
    ...receiptOf(CONTRIBUTION_FILE_ID, ANA).fileDocuments,
  },
  fileContentsGiven: receiptOf(CONTRIBUTION_FILE_ID, ANA).fileContentIds,
};

export const convertEntryScenarios = {
  // O Bruno liga Paguei só uma parte na Luz que pagou: o pagamento fica sem dono, e a contribuição dele nasce com o
  // valor e o comprovante do pagamento.
  memberTurnsPaymentIntoContribution: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_electricity': PAYMENT_DOCUMENT,
      ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments,
    },
    fileContentsGiven: receiptOf(RECEIPT_FILE_ID, BRUNO).fileContentIds,
    input: [{ entry: PAYMENT, amountCents: 18735, receipt: null }],
    result: undefined,
    expectedEntries: [
      omitCreatedAt({
        id: '2026-10_electricity',
        ...PAYMENT_DOCUMENT,
        paidBy: undefined,
        amountCents: undefined,
        receiptFileId: undefined,
      }),
      {
        id: expect.any(String),
        kind: 'contribution',
        month: '2026-10',
        entryId: '2026-10_electricity',
        amountCents: 18735,
        paidBy: testAccountUid(BRUNO),
        receiptFileId: RECEIPT_FILE_ID,
      },
    ],
    wasReceiptReplaced: false,
  },
  // A Ana desliga o interruptor na contribuição dela: o pagamento sem dono ganha a Ana como dona, com o valor e o
  // comprovante da contribuição, e a contribuição sai.
  memberTurnsContributionIntoPayment: {
    signedInAs: ANA,
    ...INTERNET_WITH_ANA,
    input: [{ entry: CONTRIBUTION_TO_UNOWNED, amountCents: 5000, receipt: null }],
    result: undefined,
    expectedEntries: [
      omitCreatedAt({
        id: '2026-10_internet',
        ...UNOWNED_PAYMENT_DOCUMENT,
        paidBy: testAccountUid(ANA),
        amountCents: 5000,
        receiptFileId: CONTRIBUTION_FILE_ID,
      }),
    ],
    wasReceiptReplaced: false,
  },
  // A mesma troca com outro arquivo: o comprovante da contribuição sai, e o pagamento fica com o novo.
  memberTurnsContributionIntoPaymentWithNewReceipt: {
    signedInAs: ANA,
    ...INTERNET_WITH_ANA,
    input: [{ entry: CONTRIBUTION_TO_UNOWNED, amountCents: 12000, receipt: NEW_RECEIPT }],
    result: undefined,
    expectedEntries: [
      omitCreatedAt({
        id: '2026-10_internet',
        ...UNOWNED_PAYMENT_DOCUMENT,
        paidBy: testAccountUid(ANA),
        amountCents: 12000,
        receiptFileId: expect.any(String),
      }),
    ],
    wasReceiptReplaced: true,
  },
} satisfies Record<string, IServiceScenario<[IConvertEntryInput], void> & IConvertEntryExpectation>;

/** Os casos recusados: o serviço lança `AppError`, a `result` é o que o erro carrega e nada muda. */
export const convertEntryRejectedScenarios = {
  // A contribuição da Ana é na Luz que o Bruno pagou: o mês já tem dono, e ela não vira o pagamento dele.
  turnsContributionIntoPaymentOfOwnedMonth: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_electricity': PAYMENT_DOCUMENT,
      'entries/c-ana': CONTRIBUTION_DOCUMENT,
      ...receiptOf(CONTRIBUTION_FILE_ID, ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf(CONTRIBUTION_FILE_ID, ANA).fileContentIds,
    input: [{ entry: CONTRIBUTION, amountCents: 4000, receipt: null }],
    result: { code: 'ENTRY_CONVERT_DENIED', userMessage: 'Não deu para transformar o lançamento.' },
  },
} satisfies Record<string, IServiceScenario<[IConvertEntryInput], { code: string; userMessage: string }>>;
