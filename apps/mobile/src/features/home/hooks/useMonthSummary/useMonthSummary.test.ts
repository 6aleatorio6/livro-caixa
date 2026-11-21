import { renderHook } from '@testing-library/react-native';

import { mockRealtimeWithSummaryReads } from '@/shared/testing/mockRealtimeWithSummaryReads';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { billMonthQueryService } from '@/shared/services/billMonth/query/billMonthQueryService';
import { overdueSourcesQueryService } from '@/shared/services/billMonth/query/overdueSourcesQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';

import { useMonthSummary } from './useMonthSummary';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/billMonth/query/billMonthQueryService', () => ({ billMonthQueryService: {} }));
jest.mock('@/shared/services/billMonth/query/overdueSourcesQueryService', () => ({
  overdueSourcesQueryService: {},
}));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const octoberEntries = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };
const novemberEntries = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.nextMonthPaidEarly };

// O mês atual é novembro de 2026 e o anterior, outubro, o primeiro do app.
const CURRENT_MONTH = '2026-11';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useMonthSummary', () => {
  it('Should put the overdue bills of October first in the current month', async () => {
    mockRealtimeWithSummaryReads(fiveBills, novemberEntries);

    const { result } = await renderHook(() => useMonthSummary({ month: '2026-11', currentMonth: CURRENT_MONTH }));

    // A Luz foi paga em outubro; sobram o Aluguel, o Condomínio, a Internet e a Água, pelo vencimento.
    expect(result.current.summary?.toPay.slice(0, 4).map(({ name, month, overdue }) => [name, month, overdue])).toEqual(
      [
        ['Aluguel', '2026-10', 'fromEarlierMonth'],
        ['Condomínio', '2026-10', 'fromEarlierMonth'],
        ['Internet', '2026-10', 'fromEarlierMonth'],
        ['Água', '2026-10', 'fromEarlierMonth'],
      ],
    );
  });

  it('Should read what decides the overdue bills only in the current month', async () => {
    mockRealtimeWithSummaryReads(fiveBills, octoberEntries);

    await renderHook(() => useMonthSummary({ month: '2026-10', currentMonth: CURRENT_MONTH }));

    expect(useRealtime).toHaveBeenCalledWith(overdueSourcesQueryService, { currentMonth: null });
    expect(useRealtime).not.toHaveBeenCalledWith(overdueSourcesQueryService, { currentMonth: '2026-11' });
  });

  it('Should not read what decides the overdue bills in a month after the current one', async () => {
    mockRealtimeWithSummaryReads(
      fiveBills,
      { service: entryMonthQueryService, status: 'loading' },
      { service: billMonthQueryService, status: 'loading' },
    );

    await renderHook(() => useMonthSummary({ month: '2026-12', currentMonth: CURRENT_MONTH }));

    expect(useRealtime).toHaveBeenCalledWith(overdueSourcesQueryService, { currentMonth: null });
    expect(useRealtime).not.toHaveBeenCalledWith(overdueSourcesQueryService, { currentMonth: '2026-11' });
  });

  it('Should show an earlier month without waiting for the overdue read, which is not made', async () => {
    mockRealtimeWithSummaryReads(fiveBills, octoberEntries);

    const { result } = await renderHook(() => useMonthSummary({ month: '2026-10', currentMonth: CURRENT_MONTH }));

    expect(result.current.summary?.toPay.map(({ overdue }) => overdue)).toEqual([
      'inItsMonth',
      'inItsMonth',
      'inItsMonth',
      'inItsMonth',
      'inItsMonth',
    ]);
  });

  it('Should keep every read of the month idle and have no summary without a month', async () => {
    mockRealtimeWithSummaryReads(
      fiveBills,
      { service: entryMonthQueryService, status: 'idle' },
      { service: billMonthQueryService, status: 'idle' },
    );

    const { result } = await renderHook(() => useMonthSummary({ month: null, currentMonth: CURRENT_MONTH }));

    expect(useRealtime).toHaveBeenCalledWith(entryMonthQueryService, { month: null });
    expect(useRealtime).toHaveBeenCalledWith(billMonthQueryService, { month: null });
    expect(useRealtime).toHaveBeenCalledWith(overdueSourcesQueryService, { currentMonth: null });
    expect(result.current.summary).toBeNull();
  });

  it('Should have no summary in the current month while the overdue read has not arrived', async () => {
    mockRealtimeWithSummaryReads(fiveBills, novemberEntries, {
      service: overdueSourcesQueryService,
      status: 'loading',
    });

    const { result } = await renderHook(() => useMonthSummary({ month: '2026-11', currentMonth: CURRENT_MONTH }));

    expect(result.current.summary).toBeNull();
  });

  it('Should have no summary while the bill months have not arrived', async () => {
    mockRealtimeWithSummaryReads(fiveBills, octoberEntries, { service: billMonthQueryService, status: 'loading' });

    const { result } = await renderHook(() => useMonthSummary({ month: '2026-10', currentMonth: CURRENT_MONTH }));

    expect(result.current.summary).toBeNull();
  });

  it('Should tell an error in the bill months read', async () => {
    mockRealtimeWithSummaryReads(fiveBills, octoberEntries, { service: billMonthQueryService, status: 'error' });

    const { result } = await renderHook(() => useMonthSummary({ month: '2026-10', currentMonth: CURRENT_MONTH }));

    expect(result.current.hasError).toBe(true);
  });
});
