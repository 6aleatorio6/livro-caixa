import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import {
  OVERDUE_PAYMENT_DOCUMENT,
  PAID_LATER_WATER_DOCUMENT,
  RECEIPT,
  SKIPPED_WATER_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IOverduePaymentInput } from '@/shared/types/entry/OverduePaymentInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: o Bruno paga em novembro, a Ana pulou ou já pagou em dois dos casos.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';

// A Água da lista de contas (dia 20, Serviços, R$ 98,00 previstos): a tela lê a conta dela, e a regra exige que a conta exista.
const WATER_BILL = recurringBillListQueryScenarios.fiveBills.result.find(({ id }) => id === 'water')!;
const WATER_IN_THE_LIST = {
  'recurringBills/water': recurringBillListQueryScenarios.fiveBills.given['recurringBills/water'],
};
const BRUNO_WITHOUT_ENTRIES = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
  [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
  ...WATER_IN_THE_LIST,
};
const OCTOBER_WATER = { bill: WATER_BILL, billMonth: '2026-10', amountCents: 9400, receipt: RECEIPT };
// A Ana pulou a Água de outubro em 3 de novembro, com as cópias da conta.
const SKIPPED_WATER = { ...SKIPPED_WATER_DOCUMENT, createdBy: testAccountUid(ANA) };

export const payOverdueBillScenarios = {
  // A Água de outubro, sem documento nenhum, paga em novembro: o pagamento conta no mês de hoje, com o valor corrigido.
  memberPaysOverdueBill: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [OCTOBER_WATER],
    result: undefined,
  },
  // A Ana pulou a Água de outubro, e o Bruno a paga: o `skipped` vira `paidLater`.
  memberPaysSkippedBill: {
    signedInAs: BRUNO,
    given: { ...BRUNO_WITHOUT_ENTRIES, 'billMonths/2026-10_water': SKIPPED_WATER },
    input: [OCTOBER_WATER],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IOverduePaymentInput], void>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const payOverdueBillRejectedScenarios = {
  // A Ana acabou de pagar a Água de outubro: o Bruno recebe o aviso, e nada novo é gravado.
  billAlreadyPaidLaterByAnother: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_WITHOUT_ENTRIES,
      'entries/overdue-water': { ...OVERDUE_PAYMENT_DOCUMENT, paidBy: testAccountUid(ANA) },
      'billMonths/2026-10_water': { ...PAID_LATER_WATER_DOCUMENT, createdBy: testAccountUid(ANA) },
    },
    input: [OCTOBER_WATER],
    result: { code: 'ALREADY_SETTLED', userMessage: 'Esta conta já foi paga ou pulada.' },
  },
} satisfies Record<string, IServiceScenario<[IOverduePaymentInput], { code: string; userMessage: string }>>;
