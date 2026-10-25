import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { changeOwnNameService } from '@/shared/services/allowedEmail/changeOwnName/changeOwnNameService';
import { changeOwnNameScenarios } from '@/shared/services/allowedEmail/changeOwnName/changeOwnNameService.scenarios';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { ChangeNamePage } from './ChangeNamePage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/changeOwnName/changeOwnNameService', () => ({
  changeOwnNameService: jest.fn(),
}));
// O aviso de erro se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
});

describe('ChangeNamePage', () => {
  async function renderPage() {
    mockRealtime({ service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList });
    await render(<ChangeNamePage />);
    return userEvent.setup();
  }

  async function typeName(user: Awaited<ReturnType<typeof renderPage>>, name: string) {
    await user.clear(screen.getByLabelText('Nome'));
    if (name) await user.type(screen.getByLabelText('Nome'), name);
  }

  it('Should start with the current name in the field', async () => {
    await renderPage();

    expect(screen.getByLabelText('Nome')).toHaveDisplayValue('Bruno Souza');
  });

  it('Should show no form while the read has not answered', async () => {
    mockRealtime({ service: allowedEmailQueryService, status: 'loading' });
    await render(<ChangeNamePage />);

    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Salvar nome' })).not.toBeOnTheScreen();
  });

  it('Should show the form with the name read from the device while the server has not answered', async () => {
    // O `mockRealtime` não entrega `cached`: é uma decisão do `useRealtime`, e aqui a tela só reage a ela.
    const scenario = allowedEmailQueryScenarios.emailInList;
    jest.mocked(useRealtime).mockReturnValue({ status: 'cached', data: scenario.result });
    await render(<ChangeNamePage />);

    expect(useRealtime).toHaveBeenCalledWith(allowedEmailQueryService, scenario.input);
    expect(screen.getByLabelText('Nome')).toHaveDisplayValue('Bruno Souza');
  });

  it('Should say the name could not be loaded when the read fails', async () => {
    mockRealtime({ service: allowedEmailQueryService, status: 'error' });
    await render(<ChangeNamePage />);

    expect(screen.getByText('Não deu para carregar o seu nome.')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
  });

  it('Should save the name without the spaces at the ends, with the scenario input, and go back', async () => {
    const scenario = changeOwnNameScenarios.memberChangesOwnName;
    mockServiceScenario(changeOwnNameService, scenario);
    const user = await renderPage();

    await typeName(user, `  ${scenario.input[0].name}  `);
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));

    expect(changeOwnNameService).toHaveBeenCalledWith(...scenario.input);
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it.each([
    { case: 'an empty name', name: '' },
    { case: 'a name with only spaces', name: '   ' },
  ])('Should refuse $case and stay on the screen', async ({ name }) => {
    const user = await renderPage();

    await typeName(user, name);
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));

    expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
    expect(changeOwnNameService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should save a name of 60 characters', async () => {
    const user = await renderPage();

    await typeName(user, 'a'.repeat(60));
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));

    expect(changeOwnNameService).toHaveBeenCalledWith({
      ...changeOwnNameScenarios.memberChangesOwnName.input[0],
      name: 'a'.repeat(60),
    });
  });

  it('Should refuse a name of 61 characters and stay on the screen', async () => {
    const user = await renderPage();

    await typeName(user, 'a'.repeat(61));
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));

    expect(await screen.findByText('Use no máximo 60 caracteres.')).toBeOnTheScreen();
    expect(changeOwnNameService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should stay on the screen when the save fails', async () => {
    jest.mocked(changeOwnNameService).mockRejectedValue(new Error('Sem permissão'));
    const user = await renderPage();

    await typeName(user, 'Bruno S.');
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));

    expect(changeOwnNameService).toHaveBeenCalledTimes(1);
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should call the service once when the button is pressed twice while submitting', async () => {
    let resolveSave!: () => void;
    jest.mocked(changeOwnNameService).mockReturnValue(new Promise<void>((resolve) => (resolveSave = resolve)));
    const user = await renderPage();

    await typeName(user, 'Bruno S.');
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));
    await user.press(screen.getByRole('button', { name: 'Salvar nome' }));

    expect(changeOwnNameService).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave());
  });
});
