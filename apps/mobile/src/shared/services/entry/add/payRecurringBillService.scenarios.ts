import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: o Bruno paga, a Ana já pagou em um dos casos.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';

// O comprovante é o PNG guardado em `fixtures/`: a `uri` e o tamanho são os dele, e o contrato o envia ao Storage.
const RECEIPT: IRecurringPaymentInput['receipt'] = {
  uri: RECEIPT_FIXTURE.uri,
  name: 'comprovante.png',
  contentType: 'image/png',
  sizeBytes: RECEIPT_FIXTURE.sizeBytes,
  type: 'image',
  wasReduced: false,
};
// A Internet da lista de contas (dia 15, Serviços): a tela lê a conta dela, e a regra exige que a conta exista.
const INTERNET_BILL = recurringBillListQueryScenarios.fiveBills.result.find(({ id }) => id === 'internet')!;
const INTERNET_IN_THE_LIST = {
  'recurringBills/internet': {
    name: INTERNET_BILL.name,
    expectedAmountCents: INTERNET_BILL.expectedAmountCents,
    dayOfMonth: INTERNET_BILL.dayOfMonth,
    startsOn: INTERNET_BILL.startsOn,
    tagId: INTERNET_BILL.tagId,
  },
};
const BRUNO_WITHOUT_ENTRIES = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
  ...INTERNET_IN_THE_LIST,
};
const INTERNET = { bill: INTERNET_BILL, month: '2026-10', amountCents: 11990, receipt: RECEIPT };

export const payRecurringBillScenarios = {
  memberPaysBill: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [INTERNET],
    result: undefined,
  },
  // Sem tag na conta, o lançamento nasce sem o campo `tagId`.
  memberPaysBillWithoutTag: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...INTERNET, bill: { ...INTERNET_BILL, tagId: null } }],
    result: undefined,
  },
  // A fatura veio diferente do previsto: o lançamento guarda o valor corrigido, não o da conta.
  memberPaysWithCorrectedAmount: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...INTERNET, amountCents: 12550 }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IRecurringPaymentInput], void>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const payRecurringBillRejectedScenarios = {
  // A Ana já pagou a Internet de outubro: o Bruno recebe o aviso, e nada novo é enviado nem gravado.
  billAlreadyPaidByAnother: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_WITHOUT_ENTRIES,
      [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
      'entries/2026-10_internet': {
        kind: 'recurringPayment',
        month: '2026-10',
        recurringBillId: 'internet',
        name: 'Internet',
        amountCents: 11990,
        dueDay: 15,
        expectedAmountCents: 11990,
        tagId: UTILITIES_TAG_ID,
        paidBy: testAccountUid(ANA),
        createdAt: new Date('2026-10-08T12:00:00Z'),
        receiptFileId: 'f1',
      },
    },
    input: [INTERNET],
    result: { code: 'ALREADY_PAID', userMessage: 'Esta conta já foi paga neste mês.' },
  },
  // O Storage só aceita imagem ou PDF: com outro tipo ele recusa o envio, e nada é gravado no Firestore.
  receiptRejectedByStorage: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...INTERNET, receipt: { ...RECEIPT, name: 'comprovante.txt', contentType: 'text/plain' } }],
    result: {
      code: 'RECEIPT_UPLOAD_FAILED',
      userMessage: 'Não deu para enviar o comprovante. Confira a internet e tente de novo.',
    },
  },
} satisfies Record<string, IServiceScenario<[IRecurringPaymentInput], { code: string; userMessage: string }>>;
