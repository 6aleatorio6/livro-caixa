import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { UNOWNED_PAYMENT_DOCUMENT } from '@/shared/testing/entryFixtures';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import type { skipBillMonthService } from './skipBillMonthService';

type ISkipBillMonthArguments = Parameters<typeof skipBillMonthService>;

// A pessoa é a conta de teste das jornadas: o Bruno é membro.
const BRUNO = 'bruno.souza@exemplo.com';

// A Internet da lista de contas (dia 15, Serviços): a tela lê a conta dela, e a regra exige que a conta exista.
const INTERNET_BILL = recurringBillListQueryScenarios.fiveBills.result.find(({ id }) => id === 'internet')!;
const INTERNET_IN_THE_LIST = {
  'recurringBills/internet': recurringBillListQueryScenarios.fiveBills.given['recurringBills/internet'],
};
const BRUNO_AND_THE_BILL = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
  ...INTERNET_IN_THE_LIST,
};
const OCTOBER_INTERNET = { bill: INTERNET_BILL, month: '2026-10' };

export const skipBillMonthScenarios = {
  // Outubro da Internet, sem documento nenhum: o `skipped` guarda o nome e a tag da conta e quem pulou.
  memberSkipsOverdueMonth: {
    signedInAs: BRUNO,
    given: BRUNO_AND_THE_BILL,
    input: [OCTOBER_INTERNET],
    result: undefined,
  },
  // A conta sem tag grava o `skipped` sem o campo `tagId`.
  memberSkipsMonthOfBillWithoutTag: {
    signedInAs: BRUNO,
    given: BRUNO_AND_THE_BILL,
    input: [{ ...OCTOBER_INTERNET, bill: { ...INTERNET_BILL, tagId: null } }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<ISkipBillMonthArguments, void>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const skipBillMonthRejectedScenarios = {
  // Outubro da Internet tem contribuições, e o pagamento sem dono ocupa o id do mês: o mês não pode ser pulado.
  monthWithContributions: {
    signedInAs: BRUNO,
    given: { ...BRUNO_AND_THE_BILL, 'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT },
    input: [OCTOBER_INTERNET],
    result: {
      code: 'SKIP_DENIED',
      userMessage: 'Não deu para pular esta conta. Ela já foi paga ou tem contribuições.',
    },
  },
} satisfies Record<string, IServiceScenario<ISkipBillMonthArguments, { code: string; userMessage: string }>>;
