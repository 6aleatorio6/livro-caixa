import { findFamilyPushTokensService } from '@/shared/services/pushToken/query/findFamilyPushTokensService';
import { findFamilyPushTokensScenarios } from '@/shared/services/pushToken/query/findFamilyPushTokensService.scenarios';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import type { INotifiedEntry } from '@/shared/types/notifications/NotifiedEntry';

import { notifyFamilyOfEntry } from './notifyFamilyOfEntry';
import { sendExpoPushMessages } from './sendExpoPushMessages';

// Mocks com fábrica: o React Native Firebase e o módulo nativo das notificações não rodam no Jest.
jest.mock('expo-notifications', () => ({ AndroidImportance: { DEFAULT: 3 } }));
// A sessão muda por teste: o `get` lê o valor na hora do uso, e o nome com `mock` o libera na fábrica.
let mockCurrentUser: { uid: string } | null;
jest.mock('@/shared/services/firebase/firebaseAuth', () => ({
  firebaseAuth: {
    get currentUser() {
      return mockCurrentUser;
    },
  },
}));
jest.mock('@/shared/services/pushToken/query/findFamilyPushTokensService', () => ({
  findFamilyPushTokensService: jest.fn(),
}));
jest.mock('./sendExpoPushMessages', () => ({ sendExpoPushMessages: jest.fn() }));

const scenario = findFamilyPushTokensScenarios.anaSendsToTheRestOfTheFamily;
const { tokens } = scenario.result;

const recurringPayment: INotifiedEntry = {
  kind: 'recurringPayment',
  id: '2026-11_water',
  month: '2026-11',
  name: 'Água',
  amountCents: 9800,
};
const overduePayment: INotifiedEntry = { ...recurringPayment, kind: 'overduePayment', id: 'overdue-id' };
const oneOffBill: INotifiedEntry = { kind: 'oneOffBill', id: 'one-off-id', name: 'Farmácia', amountCents: 5490 };
const contribution: INotifiedEntry = {
  kind: 'contribution',
  targetId: '2026-11_internet',
  month: '2026-11',
  name: 'Internet',
  amountCents: 4000,
};

function warnSpy() {
  return jest.spyOn(console, 'warn').mockImplementation(() => undefined);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCurrentUser = { uid: scenario.input[0] };
  mockServiceScenario(findFamilyPushTokensService, scenario);
  jest.mocked(sendExpoPushMessages).mockResolvedValue([]);
});

describe('notifyFamilyOfEntry', () => {
  it('Should send one notification per phone of the family, opening the entry on tap', async () => {
    await notifyFamilyOfEntry(oneOffBill);

    expect(sendExpoPushMessages).toHaveBeenCalledWith(
      tokens.map((to) => ({
        to,
        title: 'Ana registrou uma conta avulsa',
        body: 'Farmácia · R$ 54,90',
        data: { url: '/entries/one-off-id' },
        channelId: 'entries',
        priority: 'high',
      })),
    );
    expect(findFamilyPushTokensService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should also send the silent message that cancels the reminder when a bill of the month is paid', async () => {
    await notifyFamilyOfEntry(recurringPayment);

    const messages = jest.mocked(sendExpoPushMessages).mock.calls[0][0];
    expect(messages.filter(({ title }) => title === undefined)).toEqual(
      tokens.map((to) => ({ to, data: { cancelReminder: '2026-11_water' }, priority: 'high' })),
    );
    expect(messages).toHaveLength(tokens.length * 2);
  });

  it.each([
    ['an overdue payment', overduePayment],
    ['a one-off bill', oneOffBill],
    ['a contribution', contribution],
  ])('Should send no silent message for %s', async (_name, entry) => {
    await notifyFamilyOfEntry(entry);

    const messages = jest.mocked(sendExpoPushMessages).mock.calls[0][0];
    expect(messages).toHaveLength(tokens.length);
    expect(messages.every(({ data }) => !('cancelReminder' in data))).toBe(true);
  });

  it('Should only log when the request to Expo fails', async () => {
    const warn = warnSpy();
    const failure = new Error('network');
    jest.mocked(sendExpoPushMessages).mockRejectedValue(failure);

    await expect(notifyFamilyOfEntry(oneOffBill)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('Não deu para avisar a família do lançamento.', failure);
    warn.mockRestore();
  });

  it('Should only log, without sending, when nobody is signed in', async () => {
    const warn = warnSpy();
    mockCurrentUser = null;

    await expect(notifyFamilyOfEntry(oneOffBill)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('Não deu para avisar a família do lançamento.', expect.any(Error));
    expect(findFamilyPushTokensService).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('Should only log when looking up the phones of the family fails', async () => {
    const warn = warnSpy();
    const failure = new Error('permission-denied');
    jest.mocked(findFamilyPushTokensService).mockRejectedValue(failure);

    await expect(notifyFamilyOfEntry(oneOffBill)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith('Não deu para avisar a família do lançamento.', failure);
    expect(sendExpoPushMessages).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
