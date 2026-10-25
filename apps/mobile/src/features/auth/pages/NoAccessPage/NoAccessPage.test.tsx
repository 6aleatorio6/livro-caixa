import { render, screen, userEvent } from '@testing-library/react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { signOutService } from '@/shared/services/auth/signOutService';
import { signOutScenarios } from '@/shared/services/auth/signOutService.scenarios';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { NoAccessPage } from './NoAccessPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/auth/signOutService', () => ({ signOutService: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
});

describe('NoAccessPage', () => {
  it('Should show the e-mail of who signed in', async () => {
    await render(<NoAccessPage />);

    expect(screen.getByText(/carla\.lima@exemplo\.com/)).toBeOnTheScreen();
  });

  it('Should sign out when Sair is pressed', async () => {
    mockServiceScenario(signOutService, signOutScenarios.memberSignsOut);
    const user = userEvent.setup();
    await render(<NoAccessPage />);

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    // Sem entrada no cenário: o `createAsyncAction` chama o serviço com um `undefined`, que não conta.
    expect(signOutService).toHaveBeenCalledTimes(1);
  });
});
