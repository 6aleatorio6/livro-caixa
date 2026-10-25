import { renderHook } from '@testing-library/react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { changeOwnNameService } from '@/shared/services/allowedEmail/changeOwnName/changeOwnNameService';
import { changeOwnNameScenarios } from '@/shared/services/allowedEmail/changeOwnName/changeOwnNameService.scenarios';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { useEnsureOwnName } from './useEnsureOwnName';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/changeOwnName/changeOwnNameService', () => ({
  changeOwnNameService: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockServiceScenario(changeOwnNameService, changeOwnNameScenarios.memberGetsGoogleName);
});

describe('useEnsureOwnName', () => {
  it('Should write the name of the Google account of a person who has no name yet', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
    mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailWithoutName });

    await renderHook(() => useEnsureOwnName());

    expect(changeOwnNameService).toHaveBeenCalledWith(...changeOwnNameScenarios.memberGetsGoogleName.input);
  });

  it('Should not write anything for a person who already has a name', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
    mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList });

    await renderHook(() => useEnsureOwnName());

    expect(changeOwnNameService).not.toHaveBeenCalled();
  });

  it('Should not write anything while the entry has not arrived', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
    mockRealtime({ service: allowedEmailQueryService, status: 'loading' });

    await renderHook(() => useEnsureOwnName());

    expect(changeOwnNameService).not.toHaveBeenCalled();
  });

  it('Should not write anything for an e-mail outside the list', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
    mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailOutsideList });

    await renderHook(() => useEnsureOwnName());

    expect(changeOwnNameService).not.toHaveBeenCalled();
  });

  it('Should write only once even when the screen renders again before the name arrives', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
    mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailWithoutName });

    const { rerender } = await renderHook(() => useEnsureOwnName());
    await rerender({});

    expect(changeOwnNameService).toHaveBeenCalledTimes(1);
  });

  it('Should only log when the write fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
    mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailWithoutName });
    const failure = new Error('permission-denied');
    jest.mocked(changeOwnNameService).mockRejectedValue(failure);

    await renderHook(() => useEnsureOwnName());

    expect(warn).toHaveBeenCalledWith('Não deu para gravar o nome da conta Google.', failure);
    warn.mockRestore();
  });
});
