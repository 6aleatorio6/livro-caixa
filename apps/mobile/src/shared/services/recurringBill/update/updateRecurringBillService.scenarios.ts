import { UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { IRecurringBillInput } from '@/shared/types/recurringBill/RecurringBillInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e toda conta recorrente é da família.
const BRUNO = 'bruno.souza@exemplo.com';
const INTERNET = { name: 'Internet', expectedAmountCents: 11990, dayOfMonth: 15, startsOn: '2026-01-01' };
const BRUNO_AND_INTERNET = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
  'recurringBills/internet': { ...INTERNET, tagId: UTILITIES_TAG_ID },
};

export const updateRecurringBillScenarios = {
  // A Internet de R$ 119,90 passa a R$ 129,90, e continua na tag Serviços.
  memberChangesAmount: {
    signedInAs: BRUNO,
    given: BRUNO_AND_INTERNET,
    input: [{ id: 'internet', ...INTERNET, expectedAmountCents: 12990, tagId: UTILITIES_TAG_ID }],
    result: undefined,
  },
  // Tirar a tag: o campo `tagId` sai do documento.
  memberRemovesTag: {
    signedInAs: BRUNO,
    given: BRUNO_AND_INTERNET,
    input: [{ id: 'internet', ...INTERNET, tagId: null as string | null }],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IRecurringBillInput & Pick<IRecurringBill, 'id'>], void>>;

/**
 * Os casos recusados: o serviço rejeita com o erro do Firestore, e a `result` é o que ele carrega. O
 * código é o do SDK de JavaScript dos testes; o do app tem o prefixo `firestore/`.
 */
export const updateRecurringBillRejectedScenarios = {
  // Outro membro excluiu a conta com a alteração aberta: salvar não a recria.
  billDeletedInTheMeantime: {
    signedInAs: BRUNO,
    given: { [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true } },
    input: [{ id: 'internet', ...INTERNET, expectedAmountCents: 12990, tagId: UTILITIES_TAG_ID }],
    result: { code: 'not-found' },
  },
} satisfies Record<string, IServiceScenario<[IRecurringBillInput & Pick<IRecurringBill, 'id'>], { code: string }>>;
