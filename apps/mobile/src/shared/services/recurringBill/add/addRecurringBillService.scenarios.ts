import { HOME_TAG_ID } from '@/shared/testing/tagFixtures';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e toda conta recorrente é da família.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_IN_THE_LIST = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

export const addRecurringBillScenarios = {
  // Exatamente o que a tela envia, com os dados do design: a conta Gás, da tag Casa.
  memberAddsBill: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: [{ name: 'Gás', expectedAmountCents: 12000, dayOfMonth: 25, startsOn: '2026-11-01', tagId: HOME_TAG_ID }],
    result: undefined,
  },
  // Sem tag, a tela envia `tagId: null` e o documento nasce sem o campo.
  memberAddsBillWithNullTag: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: [{ name: 'Gás', expectedAmountCents: 12000, dayOfMonth: 25, startsOn: '2026-11-01', tagId: null }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IRecurringBillInput], void>>;
