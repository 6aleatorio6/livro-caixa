import { ANA, BOTH_IN_THE_LIST, BRUNO } from '@/shared/testing/entryFixtures';
import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';
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
const toOverdueMonth = (
  id: string,
  paidOn: string,
  { createdAt: _createdAt, ...overdueMonth }: Record<string, unknown>,
) => ({ id, entryId: null, tagId: null, ...overdueMonth, paidOn }) as IOverdueMonth;

const SKIPPED_INTERNET_RESULT = toOverdueMonth('2026-10_internet', '2026-11-03', SKIPPED_INTERNET);
const PAID_LATER_WATER_RESULT = toOverdueMonth('2026-10_water', '2026-11-05', PAID_LATER_WATER);

export const overdueMonthQueryScenarios = {
  // O mês pulado chega com o `entryId` `null`; o de setembro fica de fora.
  monthWithSkippedBill: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'overdueMonths/2026-10_internet': SKIPPED_INTERNET,
      'overdueMonths/2026-09_rent': SEPTEMBER_RENT,
    },
    input: { month: '2026-10' },
    result: [SKIPPED_INTERNET_RESULT],
  },
  // O mês pago depois chega com o `entryId` do pagamento atrasado que o pagou.
  monthWithPaidLaterBill: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'overdueMonths/2026-10_water': PAID_LATER_WATER },
    input: { month: '2026-10' },
    result: [PAID_LATER_WATER_RESULT],
  },
  // Só há um overdueMonths de setembro: outubro vem vazio.
  monthWithoutOverdueMonths: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'overdueMonths/2026-09_rent': SEPTEMBER_RENT },
    input: { month: '2026-10' },
    result: [],
  },
  // Novembro, o mês depois do primeiro do app, ainda sem nenhum mês de conta: a leitura vem vazia.
  novemberWithoutOverdueMonths: {
    signedInAs: ANA,
    given: BOTH_IN_THE_LIST,
    input: { month: '2026-11' },
    result: [],
  },
  // Um `status` que o app não conhece (gravado por uma versão mais nova) fica de fora.
  monthWithUnknownStatus: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'overdueMonths/2026-10_internet': SKIPPED_INTERNET,
      'overdueMonths/2026-10_water': { ...PAID_LATER_WATER, status: 'refunded' },
    },
    input: { month: '2026-10' },
    result: [SKIPPED_INTERNET_RESULT],
  },
  // A Ana pula a Internet com a lista de outubro aberta: o mês pulado chega.
  overdueMonthAddedWhileOpen: {
    signedInAs: ANA,
    given: { ...BOTH_IN_THE_LIST, 'overdueMonths/2026-10_water': PAID_LATER_WATER },
    input: { month: '2026-10' },
    result: [PAID_LATER_WATER_RESULT],
    afterChange: {
      write: { 'overdueMonths/2026-10_internet': { ...SKIPPED_INTERNET, createdAt: new Date('2026-11-06T12:00:00Z') } },
      result: [PAID_LATER_WATER_RESULT, toOverdueMonth('2026-10_internet', '2026-11-06', SKIPPED_INTERNET)],
    },
  },
} satisfies Record<string, IServiceScenario<{ month: string }, IOverdueMonth[]>>;
