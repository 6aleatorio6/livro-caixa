import { act, render, screen, userEvent } from '@testing-library/react-native';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { addAllowedEmailService } from '@/shared/services/allowedEmail/add/addAllowedEmailService';
import { addAllowedEmailScenarios } from '@/shared/services/allowedEmail/add/addAllowedEmailService.scenarios';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { removeAllowedEmailService } from '@/shared/services/allowedEmail/remove/removeAllowedEmailService';
import { removeAllowedEmailScenarios } from '@/shared/services/allowedEmail/remove/removeAllowedEmailService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { AllowedEmailsPage } from './AllowedEmailsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/add/addAllowedEmailService', () => ({ addAllowedEmailService: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/remove/removeAllowedEmailService', () => ({
  removeAllowedEmailService: jest.fn(),
}));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
});

describe('AllowedEmailsPage', () => {
  it('Should list the family in order with the situation of each person', async () => {
    mockRealtime({ service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList });
    await render(<AllowedEmailsPage />);

    const names = screen.getAllByText(/^(Ana|Bruno|Clara) Souza$/).map((node) => node.props.children);
    expect(names).toEqual(['Ana Souza', 'Bruno Souza', 'Clara Souza']);
    expect(screen.getByText('Admin · você')).toBeOnTheScreen();
    expect(screen.getByText('Tem lançamentos: não sai da lista')).toBeOnTheScreen();
    expect(screen.getByText('Sem lançamentos')).toBeOnTheScreen();
    expect(screen.getByText('clara.souza@exemplo.com')).toBeOnTheScreen();
  });

  it('Should show the number of people in the family', async () => {
    mockRealtime({ service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList });
    await render(<AllowedEmailsPage />);

    expect(screen.getByText('Na família')).toBeOnTheScreen();
    expect(screen.getByText('3 pessoas')).toBeOnTheScreen();
  });

  it('Should mark another admin only as Admin', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
    mockRealtime({ service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList });
    await render(<AllowedEmailsPage />);

    expect(screen.getByText('Admin')).toBeOnTheScreen();
    expect(screen.queryByText('Admin · você')).not.toBeOnTheScreen();
  });

  it('Should show the person who enters the list while the screen is open', async () => {
    const realtime = mockRealtime({
      service: allowedEmailListQueryService,
      scenario: allowedEmailListQueryScenarios.personAddedWhileOpen,
    });
    await render(<AllowedEmailsPage />);
    expect(screen.queryByText('Carla Lima')).not.toBeOnTheScreen();

    await act(async () => realtime.applyChange(allowedEmailListQueryService));

    expect(screen.getByText('Carla Lima')).toBeOnTheScreen();
    expect(screen.getByText('4 pessoas')).toBeOnTheScreen();
  });

  it('Should show no list while the read has no data', async () => {
    mockRealtime({ service: allowedEmailListQueryService, status: 'loading' });
    await render(<AllowedEmailsPage />);

    expect(screen.queryByText('Na família')).not.toBeOnTheScreen();
  });

  it('Should tell the list could not load, in place of the list', async () => {
    mockRealtime({ service: allowedEmailListQueryService, status: 'error' });
    await render(<AllowedEmailsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(screen.queryByText('Na família')).not.toBeOnTheScreen();
  });

  describe('Add person', () => {
    async function renderFamilyList() {
      mockRealtime({ service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList });
      await render(<AllowedEmailsPage />);
      return userEvent.setup();
    }

    async function fillAndSubmit(user: Awaited<ReturnType<typeof renderFamilyList>>, name: string, email: string) {
      if (name) await user.type(screen.getByLabelText('Nome'), name);
      if (email) await user.type(screen.getByLabelText('E-mail do Google'), email);
      await user.press(screen.getByRole('button', { name: 'Adicionar à família' }));
    }

    it('Should add a valid person with the scenario input and clear the form', async () => {
      const scenario = addAllowedEmailScenarios.adminAddsCarla;
      mockServiceScenario(addAllowedEmailService, scenario);
      const user = await renderFamilyList();

      // O nome digitado com espaços nas pontas chega ao serviço aparado, como o cenário diz.
      await fillAndSubmit(user, ` ${scenario.input[0].name} `, scenario.input[0].email);

      expect(addAllowedEmailService).toHaveBeenCalledWith(...scenario.input);
      expect(screen.getByLabelText('Nome')).toHaveDisplayValue('');
      expect(screen.getByLabelText('E-mail do Google')).toHaveDisplayValue('');
    });

    it.each([
      { case: 'an empty name', name: '', email: 'carla.lima@exemplo.com', message: 'Preencha este campo.' },
      {
        case: 'a name with only spaces',
        name: '   ',
        email: 'carla.lima@exemplo.com',
        message: 'Preencha este campo.',
      },
      { case: 'an empty e-mail', name: 'Carla Lima', email: '', message: 'Preencha este campo.' },
      {
        case: 'an e-mail in the wrong format',
        name: 'Carla Lima',
        email: 'carla.lima',
        message: 'Digite um e-mail válido.',
      },
    ])('Should refuse $case', async ({ name, email, message }) => {
      const user = await renderFamilyList();

      await fillAndSubmit(user, name, email);

      expect(await screen.findByText(message)).toBeOnTheScreen();
      expect(addAllowedEmailService).not.toHaveBeenCalled();
    });

    it('Should refuse an e-mail already in the list and say whose it is', async () => {
      const user = await renderFamilyList();

      await fillAndSubmit(user, 'Outro Bruno', 'bruno.souza@exemplo.com');

      expect(await screen.findByText('Este e-mail já está na lista, com o nome Bruno Souza.')).toBeOnTheScreen();
      expect(addAllowedEmailService).not.toHaveBeenCalled();
    });

    it('Should refuse an e-mail in the list even written with capitals', async () => {
      const user = await renderFamilyList();

      await fillAndSubmit(user, 'Outro Bruno', 'Bruno.Souza@Exemplo.com');

      expect(await screen.findByText('Este e-mail já está na lista, com o nome Bruno Souza.')).toBeOnTheScreen();
      expect(addAllowedEmailService).not.toHaveBeenCalled();
    });

    it('Should keep the add button disabled while the list has not arrived', async () => {
      mockRealtime({ service: allowedEmailListQueryService, status: 'loading' });
      await render(<AllowedEmailsPage />);

      expect(screen.getByRole('button', { name: 'Adicionar à família' })).toBeDisabled();
    });

    it('Should call the service once when the button is pressed twice while submitting', async () => {
      let resolveAdd!: () => void;
      jest.mocked(addAllowedEmailService).mockReturnValue(new Promise<void>((resolve) => (resolveAdd = resolve)));
      const user = await renderFamilyList();
      await user.type(screen.getByLabelText('Nome'), 'Carla Lima');
      await user.type(screen.getByLabelText('E-mail do Google'), 'carla.lima@exemplo.com');

      await user.press(screen.getByRole('button', { name: 'Adicionar à família' }));
      await user.press(screen.getByRole('button', { name: 'Adicionar à família' }));

      expect(addAllowedEmailService).toHaveBeenCalledTimes(1);
      await act(async () => resolveAdd());
    });
  });

  describe('Remove person', () => {
    it('Should offer Remover only for who is not admin and has no entries, and remove with the scenario input', async () => {
      const scenario = removeAllowedEmailScenarios.adminRemovesClara;
      mockServiceScenario(removeAllowedEmailService, scenario);
      mockRealtime({ service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList });
      await render(<AllowedEmailsPage />);

      expect(screen.getAllByRole('button', { name: /^Remover / })).toHaveLength(1);
      await userEvent.setup().press(screen.getByRole('button', { name: 'Remover Clara Souza' }));

      expect(removeAllowedEmailService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Clara Souza saiu da lista', 'success');
    });
  });
});
