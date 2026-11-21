import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { MISSING_RECEIPT_URI, RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: o Bruno paga, a Ana já pagou em um dos casos.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';

// O comprovante é o PNG guardado em `fixtures/`: a `uri` e o tamanho são os dele, e o contrato grava os bytes dele.
const RECEIPT: IRecurringPaymentInput['receipt'] = {
  uri: RECEIPT_FIXTURE.uri,
  name: 'comprovante.png',
  contentType: 'image/png',
  sizeBytes: RECEIPT_FIXTURE.sizeBytes,
  type: 'image',
  wasReduced: false,
  readAmountCents: null,
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
// A Luz da lista de contas (dia 10, previsto R$ 210,00): o mês com contribuições mostra as cópias do pagamento sem dono.
const ELECTRICITY_BILL = recurringBillListQueryScenarios.fiveBills.result.find(({ id }) => id === 'electricity')!;
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
  // O OCR leu R$ 125,50 no comprovante, e o valor pago é o lido; o valor lido não vai para o Firestore.
  memberPaysWithAmountReadFromReceipt: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...INTERNET, amountCents: 12550, receipt: { ...RECEIPT, readAmountCents: 12550 } }],
    result: undefined,
  },
  // A Internet de outubro tem a contribuição da Ana, e o pagamento sem dono guardou o previsto de R$ 120,00 (a conta
  // mudou depois): o Bruno paga o mês, o mesmo documento ganha o dono, e as cópias e a contribuição ficam.
  memberPaysMonthWithContributions: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_WITHOUT_ENTRIES,
      [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
      'entries/2026-10_internet': {
        kind: 'recurringPayment',
        month: '2026-10',
        recurringBillId: 'internet',
        name: 'Internet',
        dueDay: 15,
        expectedAmountCents: 12000,
        tagId: UTILITIES_TAG_ID,
        createdAt: new Date('2026-10-08T12:00:00Z'),
      },
      'entries/c-ana': {
        kind: 'contribution',
        month: '2026-10',
        entryId: '2026-10_internet',
        amountCents: 4000,
        paidBy: testAccountUid(ANA),
        createdAt: new Date('2026-10-08T12:00:00Z'),
        receiptFileId: 'f-ana',
      },
    },
    input: [{ ...INTERNET, amountCents: 12000 }],
    result: undefined,
  },
  // A Luz de novembro tem R$ 100,00 da Ana, e o pagamento sem dono guardou o dia 20 e o previsto de R$ 200,00 (a conta de
  // hoje diz dia 10 e R$ 210,00): a tela manda a conta com essas cópias, e o Bruno paga a conta inteira.
  memberPaysElectricityWithContributions: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_WITHOUT_ENTRIES,
      'recurringBills/electricity': {
        name: ELECTRICITY_BILL.name,
        expectedAmountCents: ELECTRICITY_BILL.expectedAmountCents,
        dayOfMonth: ELECTRICITY_BILL.dayOfMonth,
        startsOn: ELECTRICITY_BILL.startsOn,
        tagId: ELECTRICITY_BILL.tagId,
      },
      [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
      'entries/2026-11_electricity': {
        kind: 'recurringPayment',
        month: '2026-11',
        recurringBillId: 'electricity',
        name: 'Luz',
        dueDay: 20,
        expectedAmountCents: 20000,
        tagId: HOME_TAG_ID,
        createdAt: new Date('2026-11-08T12:00:00Z'),
      },
      'entries/c-ana': {
        kind: 'contribution',
        month: '2026-11',
        entryId: '2026-11_electricity',
        amountCents: 10000,
        paidBy: testAccountUid(ANA),
        createdAt: new Date('2026-11-08T12:00:00Z'),
        receiptFileId: 'f-ana',
      },
    },
    input: [
      {
        bill: { ...ELECTRICITY_BILL, dayOfMonth: 20, expectedAmountCents: 20000, tagId: HOME_TAG_ID },
        month: '2026-11',
        amountCents: 20000,
        receipt: RECEIPT,
      },
    ],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IRecurringPaymentInput], void>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const payRecurringBillRejectedScenarios = {
  // A Ana já pagou a Internet de outubro: o Bruno recebe o aviso, e nada novo é gravado.
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
  // O arquivo escolhido sumiu do aparelho antes de salvar (o cache foi limpo): não dá para ler os bytes, e nada é gravado.
  receiptUnreadable: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...INTERNET, receipt: { ...RECEIPT, uri: MISSING_RECEIPT_URI } }],
    result: {
      code: 'RECEIPT_UNREADABLE',
      userMessage: 'Não deu para ler o arquivo. Escolha outro.',
    },
  },
} satisfies Record<string, IServiceScenario<[IRecurringPaymentInput], { code: string; userMessage: string }>>;
