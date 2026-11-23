import { cancelScheduledNotificationAsync, registerTaskAsync } from 'expo-notifications';
import { defineTask } from 'expo-task-manager';

import './registerReminderCancelTask';

// Mocks com fábrica: os módulos nativos não rodam no Jest.
jest.mock('expo-notifications', () => ({
  cancelScheduledNotificationAsync: jest.fn(),
  registerTaskAsync: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));

type ITaskExecutor = (body: { data: unknown; error: unknown }) => Promise<void>;

// O módulo define e registra a tarefa ao ser importado: o que ele chamou é lido antes de qualquer limpeza dos mocks.
const [[taskName, executor]] = jest.mocked(defineTask).mock.calls as unknown as [[string, ITaskExecutor]];
const registeredTaskNames = jest.mocked(registerTaskAsync).mock.calls.map(([name]) => name);

const headless = (data: object) => ({
  data: { data: { dataString: JSON.stringify(data) }, notification: null },
  error: null,
});

beforeEach(() => {
  jest.mocked(cancelScheduledNotificationAsync).mockClear();
});

describe('registerReminderCancelTask', () => {
  it('Should define the task and register it for the silent notifications', () => {
    expect(registeredTaskNames).toEqual([taskName]);
  });

  it('Should cancel the reminder whose id the silent message brings', async () => {
    await executor(headless({ cancelReminder: '2026-11_internet' }));

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('2026-11_internet');
  });

  it('Should cancel nothing when the data has no cancelReminder', async () => {
    await executor(headless({ url: '/entries/2026-11_internet' }));

    expect(cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });

  it('Should cancel nothing when the task fails', async () => {
    await executor({ data: null, error: { code: 1, message: 'falhou' } });

    expect(cancelScheduledNotificationAsync).not.toHaveBeenCalled();
  });
});
