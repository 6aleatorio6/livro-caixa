import { act, render, screen } from '@testing-library/react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { AllowedEmailsPage } from './AllowedEmailsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));

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
});
