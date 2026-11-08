import { findMinimumAppVersionService } from '@/shared/services/appSettings/findMinimumAppVersionService';
import { findMinimumAppVersionScenarios } from '@/shared/services/appSettings/findMinimumAppVersionService.scenarios';
import { useAppVersionLockStore } from '@/shared/store/appVersionLock.store';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { checkAppVersion } from './checkAppVersion';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/services/appSettings/findMinimumAppVersionService', () => ({
  findMinimumAppVersionService: jest.fn(),
}));
// A versão instalada muda por teste: o `get` lê o valor na hora do uso, e o nome com `mock` o libera na fábrica.
let mockInstalledVersion = '0.4.0';
jest.mock('@/shared/constants/appVersion', () => ({
  get APP_VERSION() {
    return mockInstalledVersion;
  },
}));

const NOT_REQUIRED = { requiredVersion: null };

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockInstalledVersion = '0.4.0';
  useAppVersionLockStore.setState(NOT_REQUIRED);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('checkAppVersion', () => {
  it('Should require the minimum version when the installed one is below it', async () => {
    mockServiceScenario(findMinimumAppVersionService, findMinimumAppVersionScenarios.minimumVersionSet);

    await checkAppVersion();

    expect(findMinimumAppVersionService).toHaveBeenCalledTimes(1);
    expect(useAppVersionLockStore.getState()).toEqual({ requiredVersion: '0.5.0' });
  });

  it.each(['0.5.0', '0.6.0'])('Should not require anything when the installed version is %s', async (installed) => {
    mockInstalledVersion = installed;
    mockServiceScenario(findMinimumAppVersionService, findMinimumAppVersionScenarios.minimumVersionSet);

    await checkAppVersion();

    expect(useAppVersionLockStore.getState()).toEqual(NOT_REQUIRED);
  });

  it('Should not require anything when there is no settings document', async () => {
    mockServiceScenario(findMinimumAppVersionService, findMinimumAppVersionScenarios.noAppSettings);

    await checkAppVersion();

    expect(useAppVersionLockStore.getState()).toEqual(NOT_REQUIRED);
  });

  it('Should lift the requirement when the minimum no longer is above the installed version', async () => {
    useAppVersionLockStore.setState({ requiredVersion: '0.5.0' });
    mockServiceScenario(findMinimumAppVersionService, findMinimumAppVersionScenarios.noAppSettings);

    await checkAppVersion();

    expect(useAppVersionLockStore.getState()).toEqual(NOT_REQUIRED);
  });

  it('Should not require anything when the read fails', async () => {
    // O contrato não derruba o Firestore: a falha é a do SDK sem internet e sem cache.
    jest.mocked(findMinimumAppVersionService).mockRejectedValue(new Error('Sem conexão com o Firestore'));

    await checkAppVersion();

    expect(useAppVersionLockStore.getState()).toEqual(NOT_REQUIRED);
  });

  // O layout (ao abrir) e o Início (ao ganhar o foco) conferem quase juntos: duas leituras em voo poderiam chegar fora
  // de ordem, e a resposta mais velha, por último, desfaria a mais nova.
  it('Should share one read between checks that overlap', async () => {
    let answerRead!: (minimumVersion: string | null) => void;
    jest.mocked(findMinimumAppVersionService).mockReturnValue(
      new Promise((resolve) => {
        answerRead = resolve;
      }),
    );

    const firstCheck = checkAppVersion();
    const secondCheck = checkAppVersion();
    answerRead(findMinimumAppVersionScenarios.minimumVersionSet.result);
    await Promise.all([firstCheck, secondCheck]);

    expect(findMinimumAppVersionService).toHaveBeenCalledTimes(1);
    expect(useAppVersionLockStore.getState()).toEqual({ requiredVersion: '0.5.0' });
  });

  it('Should read again after the previous check ended', async () => {
    mockServiceScenario(findMinimumAppVersionService, findMinimumAppVersionScenarios.noAppSettings);
    await checkAppVersion();
    mockServiceScenario(findMinimumAppVersionService, findMinimumAppVersionScenarios.minimumVersionSet);

    await checkAppVersion();

    expect(findMinimumAppVersionService).toHaveBeenCalledTimes(2);
    expect(useAppVersionLockStore.getState()).toEqual({ requiredVersion: '0.5.0' });
  });

  describe('When the read does not answer', () => {
    beforeEach(() => {
      jest.mocked(findMinimumAppVersionService).mockReturnValue(new Promise(() => {}));
    });

    it('Should keep waiting until the 3 s are over', async () => {
      let hasEnded = false;
      void checkAppVersion().then(() => {
        hasEnded = true;
      });

      await jest.advanceTimersByTimeAsync(2999);
      expect(hasEnded).toBe(false);

      await jest.advanceTimersByTimeAsync(1);
      expect(hasEnded).toBe(true);
    });

    it('Should not require anything once the 3 s are over', async () => {
      const check = checkAppVersion();

      await jest.advanceTimersByTimeAsync(3000);
      await check;

      expect(useAppVersionLockStore.getState()).toEqual(NOT_REQUIRED);
    });
  });

  // A conferência já seguiu sem a versão mínima: a resposta que chega depois do prazo não pode trancar um app aberto.
  it('Should drop an answer that arrives after the 3 s', async () => {
    jest.mocked(findMinimumAppVersionService).mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => resolve(findMinimumAppVersionScenarios.minimumVersionSet.result), 3500);
      }),
    );

    const check = checkAppVersion();
    await jest.advanceTimersByTimeAsync(3500);
    await check;

    expect(useAppVersionLockStore.getState()).toEqual(NOT_REQUIRED);
  });
});
