import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e toda conta recorrente é da família.
const BRUNO = 'bruno.souza@exemplo.com';

export const removeRecurringBillScenarios = {
  memberRemovesBill: {
    signedInAs: BRUNO,
    given: {
      [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
      'recurringBills/rent': { name: 'Aluguel', expectedAmountCents: 180000, dayOfMonth: 5, startsOn: '2026-01-01', tagId: HOME_TAG_ID },
      'recurringBills/internet': { name: 'Internet', expectedAmountCents: 11990, dayOfMonth: 15, startsOn: '2026-01-01', tagId: UTILITIES_TAG_ID },
    },
    input: [{ id: 'internet' }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[{ id: string }], void>>;
