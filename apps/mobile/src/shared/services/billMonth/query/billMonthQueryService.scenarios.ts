import { ANA, BOTH_IN_THE_LIST, BRUNO } from '@/shared/testing/entryFixtures';
import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IBillMonth } from '@/shared/types/billMonth/BillMonth';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A Internet de outubro, pulada pela Ana em 3 de novembro: o skipped não tem o campo `entryId`.
const SKIPPED_INTERNET = {
  status: 'skipped',
  createdAt: new Date('2026-11-03T12:00:00Z'),
  month: '2026-10',
  recurringBillId: 'internet',
  name: 'Internet',
  tagId: HOME_TAG_ID,
  createdBy: testAccountUid(ANA),
};
// A Água de outubro, paga pela Ana em 5 de novembro: o paidLater aponta para o pagamento atrasado.
const PAID_LATER_WATER = {
  status: 'paidLater',
  createdAt: new Date('2026-11-05T12:00:00Z'),
  month: '2026-10',
  recurringBillId: 'water',
  entryId: 'overdue-water',
  name: 'Água',
  tagId: UTILITIES_TAG_ID,
  createdBy: testAccountUid(ANA),
};
// Um mês de outra conta e de outro mês: a leitura de outubro não o traz.
const SEPTEMBER_RENT = {
  ...SKIPPED_INTERNET,
  month: '2026-09',
  recurringBillId: 'rent',
  name: 'Aluguel',
  createdBy: testAccountUid(BRUNO),
};

// O que a tela recebe: os mesmos campos, sem `createdAt`, com o dia dele em `paidOn`, e `entryId` e `tagId` `null` sem valor.
const toBillMonth = (id: string, paidOn: string, { createdAt: _createdAt, ...billMonth }: Record<string, unknown>) =>
  ({ id, entryId: null, tagId: null, ...billMonth, paidOn }) as IBillMonth;

const SKIPPED_INTERNET_RESULT = toBillMonth('2026-10_internet', '2026-11-03', SKIPPED_INTERNET);
const PAID_LATER_WATER_RESULT = toBillMonth('2026-10_water', '2026-11-05', PAID_LATER_WATER);

export const billMonthQueryScenarios = {
  // O mês pulado chega com o `entryId` `null`; o de setembro fica de fora.
  monthWithSkippedBill: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'billMonths/2026-10_internet': SKIPPED_INTERNET,
      'billMonths/2026-09_rent': SEPTEMBER_RENT,
    },
    input: { month: '2026-10' },
    result: [SKIPPED_INTERNET_RESULT],
  },
  // O mês pago depois chega com o `entryId` do pagamento atrasado que o pagou.
  monthWithPaidLaterBill: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'billMonths/2026-10_water': PAID_LATER_WATER },
    input: { month: '2026-10' },
    result: [PAID_LATER_WATER_RESULT],
  },
  // Só há um billMonths de setembro: outubro vem vazio.
  monthWithoutBillMonths: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'billMonths/2026-09_rent': SEPTEMBER_RENT },
    input: { month: '2026-10' },
    result: [],
  },
  // Um `status` que o app não conhece (gravado por uma versão mais nova) fica de fora.
  monthWithUnknownStatus: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'billMonths/2026-10_internet': SKIPPED_INTERNET,
      'billMonths/2026-10_water': { ...PAID_LATER_WATER, status: 'refunded' },
    },
    input: { month: '2026-10' },
    result: [SKIPPED_INTERNET_RESULT],
  },
  // A Ana pula a Internet com a lista de outubro aberta: o mês pulado chega.
  billMonthAddedWhileOpen: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'billMonths/2026-10_water': PAID_LATER_WATER },
    input: { month: '2026-10' },
    result: [PAID_LATER_WATER_RESULT],
    afterChange: {
      write: { 'billMonths/2026-10_internet': { ...SKIPPED_INTERNET, createdAt: new Date('2026-11-06T12:00:00Z') } },
      result: [PAID_LATER_WATER_RESULT, toBillMonth('2026-10_internet', '2026-11-06', SKIPPED_INTERNET)],
    },
  },
} satisfies Record<string, IServiceScenario<{ month: string }, IBillMonth[]>>;
