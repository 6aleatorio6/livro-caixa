import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import {
  ANA,
  BOTH_IN_THE_LIST,
  OVERDUE_PAYMENT_DOCUMENT,
  PAID_LATER_WATER_DOCUMENT,
  SKIPPED_WATER_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import type { undoSkipBillMonthService } from './undoSkipBillMonthService';

type IUndoSkipBillMonthArguments = Parameters<typeof undoSkipBillMonthService>;

// A pessoa é a conta de teste das jornadas: o Bruno pulou a Internet de outubro e desfaz o pulo logo depois.
const BRUNO = 'bruno.souza@exemplo.com';

// As contas da lista de contas: a tela desfaz o pulo da conta que a leitura entrega.
const BILLS = recurringBillListQueryScenarios.fiveBills.result;
const INTERNET_BILL = BILLS.find(({ id }) => id === 'internet')!;
const WATER_BILL = BILLS.find(({ id }) => id === 'water')!;

export const undoSkipBillMonthScenarios = {
  // O `skipped` some, e o mês volta a ser uma conta atrasada; os meses pulados das outras contas ficam.
  memberUndoesSkip: {
    signedInAs: BRUNO,
    given: {
      [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
      'billMonths/2026-10_internet': { ...SKIPPED_WATER_DOCUMENT, recurringBillId: 'internet', name: 'Internet' },
      'billMonths/2026-10_rent': { ...SKIPPED_WATER_DOCUMENT, recurringBillId: 'rent', name: 'Aluguel' },
      'billMonths/2026-10_gas': { ...SKIPPED_WATER_DOCUMENT, recurringBillId: 'gas', name: 'Gás' },
    },
    input: [{ bill: INTERNET_BILL, month: '2026-10' }],
    result: undefined,
  },
  // O segundo Desfazer (ou o de outro membro, ao mesmo tempo) encontra o mês já apagado: termina sem erro.
  memberUndoesSkipAlreadyUndone: {
    signedInAs: BRUNO,
    given: { [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false } },
    input: [{ bill: INTERNET_BILL, month: '2026-10' }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<IUndoSkipBillMonthArguments, void>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const undoSkipBillMonthRejectedScenarios = {
  // A Ana pulou a Água de outubro, e o Bruno a pagou antes do Desfazer dela: o mês virou `paidLater` e fica pago.
  monthPaidLaterByAnother: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/overdue-water': OVERDUE_PAYMENT_DOCUMENT,
      'billMonths/2026-10_water': PAID_LATER_WATER_DOCUMENT,
    },
    input: [{ bill: WATER_BILL, month: '2026-10' }],
    result: { code: 'UNDO_SKIP_DENIED', userMessage: 'Não deu para desfazer o pulo. A conta já foi paga.' },
  },
} satisfies Record<string, IServiceScenario<IUndoSkipBillMonthArguments, { code: string; userMessage: string }>>;
