import { act, renderHook } from '@testing-library/react-native';
import {
  cancelAllScheduledNotificationsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';

import { useBillReminders } from './useBillReminders';

// Mocks com fábrica: o módulo nativo e o React Native Firebase não rodam no Jest.
jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 5 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const octoberEntries = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };
const octoberPaymentArrives = {
  service: entryMonthQueryService,
  scenario: entryMonthQueryScenarios.paymentAddedWhileOpen,
};
// Em novembro só o Condomínio está pago, antes de começar o mês.
const novemberEntries = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.nextMonthPaidEarly };

beforeEach(() => {
  jest.clearAllMocks();
  // Hoje é 10 de outubro de 2026, às 8h: o mês atual é outubro e o seguinte, novembro. O relógio segue andando para a
  // cadeia de promessas do hook correr.
  jest.useFakeTimers({
    now: new Date(2026, 9, 10, 8, 0),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  jest.mocked(cancelAllScheduledNotificationsAsync).mockResolvedValue(undefined as never);
  jest.mocked(scheduleNotificationAsync).mockResolvedValue('id');
});

afterEach(() => {
  jest.useRealTimers();
});

/** Deixa a cadeia de promessas da agenda correr até o fim: o hook não devolve nada a esperar. */
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const scheduledIdentifiers = () =>
  jest.mocked(scheduleNotificationAsync).mock.calls.map(([request]) => request.identifier);

describe('useBillReminders', () => {
  it('Should cancel the scheduled reminders and schedule those of the bills that fall due tomorrow once the data is ready', async () => {
    mockRealtime(fiveBills, octoberEntries, novemberEntries);

    await renderHook(() => useBillReminders());

    await settle();
    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    // Em outubro, a Internet (dia 15) e a Água (dia 20): as outras já venceram. Em novembro, todas menos o Condomínio, pago.
    expect(scheduledIdentifiers()).toEqual([
      '2026-10_internet',
      '2026-10_water',
      '2026-11_rent',
      '2026-11_electricity',
      '2026-11_internet',
      '2026-11_water',
    ]);
    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: '2026-10_internet',
      content: { title: 'Internet vence amanhã', body: 'R$ 119,90, ainda a pagar', data: { url: '/' } },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(2026, 9, 14, 9, 0),
        channelId: 'billReminders',
      },
    });
  });

  it('Should redo the schedule when the data changes', async () => {
    const realtime = mockRealtime(fiveBills, octoberPaymentArrives, novemberEntries);
    await renderHook(() => useBillReminders());
    await settle();
    expect(scheduledIdentifiers()).toContain('2026-10_internet');
    jest.clearAllMocks();

    // A Internet de outubro é paga com o app aberto: o lembrete dela sai da agenda.
    await act(async () => realtime.applyChange(entryMonthQueryService));
    await settle();

    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(scheduledIdentifiers()).not.toContain('2026-10_internet');
    expect(scheduledIdentifiers()).toContain('2026-10_water');
  });

  it('Should wait for the schedule in progress before redoing it, so a stale reminder does not land after the cancel', async () => {
    let finishFirstSchedule = () => undefined as void;
    jest
      .mocked(scheduleNotificationAsync)
      .mockReturnValueOnce(new Promise((resolve) => (finishFirstSchedule = () => resolve('id'))));
    const realtime = mockRealtime(fiveBills, octoberPaymentArrives, novemberEntries);
    await renderHook(() => useBillReminders());
    await settle();
    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);

    // Os dados mudam com o primeiro agendamento ainda na rede: a nova agenda espera ele terminar para cancelar.
    await act(async () => realtime.applyChange(entryMonthQueryService));
    await settle();
    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);

    finishFirstSchedule();
    await settle();
    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(2);
  });

  it.each(['loading', 'error'] as const)('Should leave the schedule alone while a read is %s', async (status) => {
    mockRealtime(fiveBills, octoberEntries, { service: entryMonthQueryService, status, input: { month: '2026-11' } });

    await renderHook(() => useBillReminders());

    await settle();
    expect(useRealtime).toHaveBeenCalled();
    expect(cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
