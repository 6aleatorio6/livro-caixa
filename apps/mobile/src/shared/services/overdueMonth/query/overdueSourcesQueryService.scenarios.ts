import { overdueMonthQueryScenarios } from '@/shared/services/overdueMonth/query/overdueMonthQueryService.scenarios';
import {
  BOTH_IN_THE_LIST,
  BRUNO,
  ONE_OFF_BILL,
  ONE_OFF_BILL_DOCUMENT,
  PAYMENT,
  PAYMENT_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import { entryOf } from '@/shared/testing/entryOf';
import type { IOverdueMonth } from '@/shared/types/overdueMonth/OverdueMonth';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As contas de hoje são a Luz (paga em outubro pelo Bruno), a Internet e a Água; o mês atual é novembro de 2026. A
// Luz e a avulsa do Bruno são os lançamentos de outubro, e a Internet e a Água ficaram sem pagamento.
const OCTOBER_ENTRIES: IEntry[] = [PAYMENT, ONE_OFF_BILL];
// Os que a leitura deixa de fora: uma avulsa de novembro (o mês atual) e uma de setembro (antes do primeiro mês do app).
const NOVEMBER_BILL = {
  ...ONE_OFF_BILL_DOCUMENT,
  createdAt: new Date('2026-11-03T12:00:00Z'),
  month: '2026-11',
  date: '2026-11-03',
};
const SEPTEMBER_BILL = {
  ...ONE_OFF_BILL_DOCUMENT,
  createdAt: new Date('2026-09-30T12:00:00Z'),
  month: '2026-09',
  date: '2026-09-30',
};
const OCTOBER_GIVEN = {
  ...BOTH_IN_THE_LIST,
  'entries/2026-10_electricity': PAYMENT_DOCUMENT,
  'entries/fridge': ONE_OFF_BILL_DOCUMENT,
  'entries/november-bill': NOVEMBER_BILL,
  'entries/september-bill': SEPTEMBER_BILL,
};

const SKIPPED = overdueMonthQueryScenarios.monthWithSkippedBill;
const SKIPPED_INTERNET = SKIPPED.result[0];
const SKIPPED_INTERNET_DOCUMENT = SKIPPED.given['overdueMonths/2026-10_internet'];
const SEPTEMBER_BILL_MONTH = SKIPPED.given['overdueMonths/2026-09_rent'];
// Um mês de conta de novembro não existe com novembro como o mês atual; a leitura o deixa de fora do mesmo jeito.
const NOVEMBER_BILL_MONTH = { ...SKIPPED_INTERNET_DOCUMENT, month: '2026-11', recurringBillId: 'water' };
const DECEMBER_BILL_MONTH = { ...SKIPPED_INTERNET_DOCUMENT, month: '2026-12', recurringBillId: 'water' };
// A avulsa de novembro com um id que vem antes dos de outubro: a ordem da leitura é a do mês, não a do id.
const AIR_CONDITIONER = { ...NOVEMBER_BILL, name: 'Ar-condicionado' };
const DECEMBER_BILL = {
  ...ONE_OFF_BILL_DOCUMENT,
  createdAt: new Date('2026-12-02T12:00:00Z'),
  month: '2026-12',
  date: '2026-12-02',
};

export const overdueSourcesQueryScenarios = {
  // Outubro até o mês anterior ao atual: a Luz e a avulsa, sem a Internet nem a Água, nenhum mês pulado ou pago depois;
  // o lançamento e o mês de conta de novembro, e os de setembro, ficam de fora.
  octoberUnpaid: {
    signedInAs: BRUNO,
    given: {
      ...OCTOBER_GIVEN,
      'overdueMonths/2026-09_rent': SEPTEMBER_BILL_MONTH,
      'overdueMonths/2026-11_water': NOVEMBER_BILL_MONTH,
    },
    input: { currentMonth: '2026-11' },
    result: { entries: OCTOBER_ENTRIES, overdueMonths: [] },
  },
  // A Internet de outubro foi pulada: vem o mês de conta dela, e a Água segue sem pagamento.
  octoberWithSkipped: {
    signedInAs: BRUNO,
    given: { ...OCTOBER_GIVEN, 'overdueMonths/2026-10_internet': SKIPPED_INTERNET_DOCUMENT },
    input: { currentMonth: '2026-11' },
    result: { entries: OCTOBER_ENTRIES, overdueMonths: [SKIPPED_INTERNET] },
  },
  // Com outubro, o primeiro mês do app, como o mês atual, não há mês anterior a ler: nada chega, nem o que é de outubro.
  noOverdue: {
    signedInAs: BRUNO,
    given: { ...OCTOBER_GIVEN, 'overdueMonths/2026-10_internet': SKIPPED_INTERNET_DOCUMENT },
    input: { currentMonth: '2026-10' },
    result: { entries: [], overdueMonths: [] },
  },
  // Em dezembro, o intervalo tem dois meses: outubro e novembro, do mais antigo ao mais novo; o que é de dezembro fica de
  // fora.
  twoMonthsBack: {
    signedInAs: BRUNO,
    given: {
      ...OCTOBER_GIVEN,
      'entries/air-conditioner': AIR_CONDITIONER,
      'entries/december-bill': DECEMBER_BILL,
      'overdueMonths/2026-10_internet': SKIPPED_INTERNET_DOCUMENT,
      'overdueMonths/2026-11_water': NOVEMBER_BILL_MONTH,
      'overdueMonths/2026-12_water': DECEMBER_BILL_MONTH,
    },
    input: { currentMonth: '2026-12' },
    result: {
      entries: [
        ...OCTOBER_ENTRIES,
        entryOf('air-conditioner', AIR_CONDITIONER),
        entryOf('november-bill', NOVEMBER_BILL),
      ],
      overdueMonths: [
        SKIPPED_INTERNET,
        { ...SKIPPED_INTERNET, id: '2026-11_water', month: '2026-11', recurringBillId: 'water' },
      ],
    },
  },
  // O Bruno pula a Internet com a leitura aberta: o mês de conta chega.
  overdueMonthAddedWhileOpen: {
    signedInAs: BRUNO,
    given: OCTOBER_GIVEN,
    input: { currentMonth: '2026-11' },
    result: { entries: OCTOBER_ENTRIES, overdueMonths: [] as IOverdueMonth[] },
    afterChange: {
      write: { 'overdueMonths/2026-10_internet': SKIPPED_INTERNET_DOCUMENT },
      result: { entries: OCTOBER_ENTRIES, overdueMonths: [SKIPPED_INTERNET] },
    },
  },
} satisfies Record<
  string,
  IServiceScenario<{ currentMonth: string }, { entries: IEntry[]; overdueMonths: IOverdueMonth[] }>
>;
