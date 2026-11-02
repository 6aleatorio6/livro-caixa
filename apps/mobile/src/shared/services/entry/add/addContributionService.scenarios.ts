import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { MISSING_RECEIPT_URI } from '@/shared/testing/contract/fixtures/receiptFixture';
import {
  ANA,
  BOTH_IN_THE_LIST,
  BRUNO,
  NEW_RECEIPT,
  PAYMENT,
  PAYMENT_DOCUMENT,
  UNOWNED_PAYMENT,
  UNOWNED_PAYMENT_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IContributionInput } from '@/shared/types/entry/ContributionInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A Internet da lista de contas: a tela do pagamento lê a conta dela, e a regra exige que a conta exista.
const INTERNET_BILL = recurringBillListQueryScenarios.fiveBills.result.find(({ id }) => id === 'internet')!;
const FAMILY_WITH_INTERNET = {
  ...BOTH_IN_THE_LIST,
  'recurringBills/internet': {
    name: INTERNET_BILL.name,
    expectedAmountCents: INTERNET_BILL.expectedAmountCents,
    dayOfMonth: INTERNET_BILL.dayOfMonth,
    startsOn: INTERNET_BILL.startsOn,
    tagId: INTERNET_BILL.tagId,
  },
};
// A contribuição da Ana na Internet, a primeira do mês: o pagamento sem dono já existe.
const ANA_ON_INTERNET = {
  kind: 'contribution',
  createdAt: new Date('2026-10-09T15:00:00Z'),
  month: '2026-10',
  entryId: '2026-10_internet',
  amountCents: 5000,
  paidBy: testAccountUid(ANA),
  receiptFileId: 'f-ana',
};

export const addContributionScenarios = {
  // A Ana contribui com R$ 40,00 na Luz que o Bruno pagou.
  memberContributesToPaidEntry: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': PAYMENT_DOCUMENT },
    input: [{ target: { entry: PAYMENT }, amountCents: 4000, receipt: NEW_RECEIPT }],
    result: undefined,
  },
  // O Bruno contribui com R$ 50,00 na Internet de outubro, ainda a pagar: o lote grava o pagamento sem dono, com as
  // cópias da conta.
  memberContributesToMonthWithoutPayment: {
    signedInAs: BRUNO,
    given: FAMILY_WITH_INTERNET,
    input: [{ target: { bill: INTERNET_BILL, month: '2026-10' }, amountCents: 5000, receipt: NEW_RECEIPT }],
    result: undefined,
  },
  // A Ana já contribuiu: o Bruno contribui no mesmo mês, e o pagamento sem dono não é gravado de novo.
  memberContributesToMonthWithUnownedPayment: {
    signedInAs: BRUNO,
    given: {
      ...FAMILY_WITH_INTERNET,
      'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
      'entries/c-ana': ANA_ON_INTERNET,
    },
    input: [{ target: { bill: INTERNET_BILL, month: '2026-10' }, amountCents: 5000, receipt: NEW_RECEIPT }],
    result: undefined,
  },
  // A contribuição pela folha do pagamento sem dono, com o lançamento em vez da conta.
  memberContributesToUnownedPaymentEntry: {
    signedInAs: BRUNO,
    given: {
      ...FAMILY_WITH_INTERNET,
      'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
      'entries/c-ana': ANA_ON_INTERNET,
    },
    input: [{ target: { entry: UNOWNED_PAYMENT }, amountCents: 5000, receipt: NEW_RECEIPT }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IContributionInput], void>>;

/** Os casos recusados: o serviço lança `AppError`, a `result` é o que o erro carrega e nada é gravado. */
export const addContributionRejectedScenarios = {
  // A Luz foi excluída pelo Bruno com a tela aberta: a regra não acha o lançamento que receberia a contribuição.
  contributesToEntryDeletedMeanwhile: {
    signedInAs: ANA,
    given: BOTH_IN_THE_LIST,
    input: [{ target: { entry: PAYMENT }, amountCents: 4000, receipt: NEW_RECEIPT }],
    result: { code: 'CONTRIBUTION_DENIED', userMessage: 'Não deu para registrar a contribuição. Tente de novo.' },
  },
  receiptUnreadable: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': PAYMENT_DOCUMENT },
    input: [{ target: { entry: PAYMENT }, amountCents: 4000, receipt: { ...NEW_RECEIPT, uri: MISSING_RECEIPT_URI } }],
    result: { code: 'RECEIPT_UNREADABLE', userMessage: 'Não deu para ler o arquivo. Escolha outro.' },
  },
} satisfies Record<string, IServiceScenario<[IContributionInput], { code: string; userMessage: string }>>;
