import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e toda conta recorrente é da família.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_IN_THE_LIST = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

// As cinco contas do design, com o que o documento grava (sem o id).
const RENT = { name: 'Aluguel', expectedAmountCents: 180000, dayOfMonth: 5, startsOn: '2026-01-01', tagId: HOME_TAG_ID };
const CONDO = { name: 'Condomínio', expectedAmountCents: 45000, dayOfMonth: 8, startsOn: '2026-01-01', tagId: HOME_TAG_ID };
const ELECTRICITY = { name: 'Luz', expectedAmountCents: 21000, dayOfMonth: 10, startsOn: '2026-01-01', tagId: UTILITIES_TAG_ID };
const INTERNET = { name: 'Internet', expectedAmountCents: 11990, dayOfMonth: 15, startsOn: '2026-01-01', tagId: UTILITIES_TAG_ID };
const WATER = { name: 'Água', expectedAmountCents: 9800, dayOfMonth: 20, startsOn: '2026-01-01', tagId: UTILITIES_TAG_ID };
const GAS = { name: 'Gás', expectedAmountCents: 12000, dayOfMonth: 25, startsOn: '2026-11-01', tagId: HOME_TAG_ID };

// Os documentos são dados fora de ordem, para provar que o serviço ordena.
const FIVE_BILLS = {
  'recurringBills/water': WATER,
  'recurringBills/rent': RENT,
  'recurringBills/internet': INTERNET,
  'recurringBills/condo': CONDO,
  'recurringBills/electricity': ELECTRICITY,
};
const FIVE_BILLS_IN_ORDER: IRecurringBill[] = [
  { id: 'rent', ...RENT },
  { id: 'condo', ...CONDO },
  { id: 'electricity', ...ELECTRICITY },
  { id: 'internet', ...INTERNET },
  { id: 'water', ...WATER },
];

export const recurringBillListQueryScenarios = {
  noBills: { signedInAs: BRUNO, given: BRUNO_IN_THE_LIST, input: {}, result: [] },
  fiveBills: {
    signedInAs: BRUNO,
    given: { ...BRUNO_IN_THE_LIST, ...FIVE_BILLS },
    input: {},
    result: FIVE_BILLS_IN_ORDER,
  },
  // A conta sem tag não tem o campo `tagId` no documento e chega com `tagId: null`.
  billWithoutTag: {
    signedInAs: BRUNO,
    given: { ...BRUNO_IN_THE_LIST, 'recurringBills/gas': { name: 'Gás', expectedAmountCents: 12000, dayOfMonth: 25, startsOn: '2026-11-01' } },
    input: {},
    result: [{ id: 'gas', ...GAS, tagId: null }],
  },
  // A tag da conta foi excluída depois (o `tagId` ficou no documento): a lista entrega o id como está.
  billWithDeletedTag: {
    signedInAs: BRUNO,
    given: { ...BRUNO_IN_THE_LIST, 'recurringBills/internet': { ...INTERNET, tagId: 'mercado' } },
    input: {},
    result: [{ id: 'internet', ...INTERNET, tagId: 'mercado' }],
  },
  // No mesmo dia do mês, vale a ordem do nome (pt-BR: o "Água" vem antes do "Luz").
  billsOnTheSameDay: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_IN_THE_LIST,
      'recurringBills/electricity': { ...ELECTRICITY, dayOfMonth: 20 },
      'recurringBills/water': WATER,
    },
    input: {},
    result: [
      { id: 'water', ...WATER },
      { id: 'electricity', ...ELECTRICITY, dayOfMonth: 20 },
    ],
  },
  billAddedWhileOpen: {
    signedInAs: BRUNO,
    given: { ...BRUNO_IN_THE_LIST, ...FIVE_BILLS },
    input: {},
    result: FIVE_BILLS_IN_ORDER,
    afterChange: { write: { 'recurringBills/gas': GAS }, result: [...FIVE_BILLS_IN_ORDER, { id: 'gas', ...GAS }] },
  },
} satisfies Record<string, IServiceScenario<object, IRecurringBill[]>>;
