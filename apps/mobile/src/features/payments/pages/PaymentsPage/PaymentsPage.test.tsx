import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { PaymentsPage } from './PaymentsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
// Ana, Bruno e Clara já entraram; a Elisa ainda não, e não ganha chip.
const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyWithPersonNotEntered };
const october = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithEntries };

beforeEach(() => {
  jest.clearAllMocks();
  // "Hoje" fixo, de outubro de 2026; o relógio segue andando para as animações não travarem.
  jest.useFakeTimers({
    now: new Date(2026, 9, 25),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PaymentsPage', () => {
  it('Should list only the entries of the signed-in member, under the header of their tag', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Pagamentos')).toBeOnTheScreen();
    expect(screen.getByText('Casa')).toBeOnTheScreen();
    expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa')).toBeOnTheScreen();
    expect(screen.queryByText('Mercado')).not.toBeOnTheScreen();
    expect(screen.queryByText('Estacionamento')).not.toBeOnTheScreen();
  });

  it('Should open the details of an entry when its row is pressed', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Farmácia' }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]', params: { id: 'pharmacy' } });
  });

  it('Should hint that a row can be pressed only when the month has entries', async () => {
    mockRealtime(october, threeTags, family);
    const { unmount } = await render(<PaymentsPage />);
    expect(screen.getByText('Toque num lançamento para ver os detalhes e o comprovante.')).toBeOnTheScreen();
    await unmount();

    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.queryByText('Toque num lançamento para ver os detalhes e o comprovante.')).not.toBeOnTheScreen();
  });

  it('Should show the sum of the member entries and their share of the family month', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Você registrou em outubro')).toBeOnTheScreen();
    // Bruno: R$ 89,90 de R$ 354,90 da família.
    expect(screen.getByText('1 lançamento · 25% do que a família pagou')).toBeOnTheScreen();
    // No cartão, no total do grupo Casa e na linha da Farmácia.
    expect(screen.getAllByText('R$ 89,90')).toHaveLength(3);
  });

  it('Should sum all the entries of the member, not only the first, against the whole family month', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithTwoEntriesOfTheMember },
      threeTags,
      family,
    );
    await render(<PaymentsPage />);

    // Bruno: R$ 89,90 + R$ 10,10 de R$ 400,00 da família (a Ana pagou R$ 300,00).
    expect(screen.getByText('R$ 100,00')).toBeOnTheScreen();
    expect(screen.getByText('2 lançamentos · 25% do que a família pagou')).toBeOnTheScreen();
    expect(screen.getByText('Padaria')).toBeOnTheScreen();
    expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    expect(screen.queryByText('Mercado')).not.toBeOnTheScreen();
  });

  it('Should list a payment of the member with the payment date and the expected value when it differs, counted in the total', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPaymentOfTheMember },
      threeTags,
      family,
    );
    await render(<PaymentsPage />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('pago em 15/10 · previsto R$ 119,90')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa')).toBeOnTheScreen();
    // Bruno: R$ 125,00 + R$ 89,90, no cartão e no total do grupo Casa, onde estão os dois.
    expect(screen.getAllByText('R$ 214,90')).toHaveLength(2);
    expect(screen.getByText('2 lançamentos · 100% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should keep the expected amount of the payment when the bill changed afterwards', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPaymentOfAlteredBill },
      threeTags,
      family,
    );
    await render(<PaymentsPage />);

    expect(screen.getByText('pago em 10/10 · previsto R$ 250,00')).toBeOnTheScreen();
  });

  it('Should show only the date for an entry without tag', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.previousMonthWithEntries },
      threeTags,
      family,
    );
    jest.setSystemTime(new Date(2026, 8, 15));
    await render(<PaymentsPage />);

    expect(screen.getByText('30/09 · avulsa')).toBeOnTheScreen();
  });

  it('Should show the empty state without the total card when the member has no entry in the month', async () => {
    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Nenhum pagamento seu em outubro')).toBeOnTheScreen();
    expect(screen.getByText('Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.')).toBeOnTheScreen();
    expect(screen.queryByText('Você registrou em outubro')).not.toBeOnTheScreen();
  });

  it('Should read the previous month when the previous month is pressed', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);
    const user = userEvent.setup();

    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.previousMonthWithEntries }, threeTags, family);
    await user.press(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(screen.getByText('Setembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Gráfica')).toBeOnTheScreen();
    expect(screen.getByText('Você registrou em setembro')).toBeOnTheScreen();
    expect(screen.queryByText('Farmácia')).not.toBeOnTheScreen();
  });

  // O pagamento do próximo mês feito antes de o mês começar aparece lá, não no mês em que foi feito.
  it('Should go to the next month and stop there', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);
    const user = userEvent.setup();

    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.nextMonthPaidEarly }, threeTags, family);
    await user.press(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(screen.getByText('Novembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Condomínio')).toBeOnTheScreen();
    expect(screen.getByText('pago em 28/10')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled();
  });

  it('Should show the loading state while the list loads', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'loading' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();
  });

  it('Should not show the loading state once the month arrives or when the read fails', async () => {
    mockRealtime(october, threeTags, family);
    const { unmount } = await render(<PaymentsPage />);
    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
    await unmount();

    mockRealtime({ service: entryMonthQueryService, status: 'error' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
  });

  it('Should show neither the list nor the empty state while the month loads', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'loading' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.queryByText('Você registrou em outubro')).not.toBeOnTheScreen();
    expect(screen.queryByText('Nenhum pagamento seu em outubro')).not.toBeOnTheScreen();
    expect(screen.queryByText('Não deu para carregar a lista.')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the read fails', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'error' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(screen.queryByText('Nenhum pagamento seu em outubro')).not.toBeOnTheScreen();
  });

  describe('Chips of the family', () => {
    it('Should open on "Você" and offer who already entered the app', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      expect(screen.getByRole('button', { name: 'Você' })).toBeSelected();
      const chips = screen.getAllByRole('button', { name: /^(Você|Ana|Clara|Elisa.*)$/ });
      expect(chips.map((chip) => chip.props.accessibilityLabel)).toEqual(['Você', 'Ana', 'Clara']);
    });

    it('Should show the entries of another member, grouped by tag, when their chip is pressed', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Ana' }));

      expect(screen.getByRole('button', { name: 'Ana' })).toBeSelected();
      // Ana: Mercado (Serviços, R$ 250,00) e Estacionamento (sem tag, R$ 15,00), de R$ 354,90 da família.
      expect(screen.getByText('Ana registrou em outubro')).toBeOnTheScreen();
      expect(screen.getByText('2 lançamentos · 74% do que a família pagou')).toBeOnTheScreen();
      const headers = screen.getAllByText(/^(Casa|Serviços|Sem tag)$/).map((node) => node.props.children);
      expect(headers).toEqual(['Serviços', 'Sem tag']);
      expect(screen.getByText('Mercado')).toBeOnTheScreen();
      expect(screen.getByText('Estacionamento')).toBeOnTheScreen();
      expect(screen.queryByText('Farmácia')).not.toBeOnTheScreen();
    });

    it('Should open the details of an entry of another member', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();

      await user.press(screen.getByRole('button', { name: 'Ana' }));
      await user.press(screen.getByRole('button', { name: 'Mercado' }));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]', params: { id: 'market' } });
    });

    it('Should say another member has no entry in the month, without the text for whoever is signed in', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Clara' }));

      expect(screen.getByText('Nenhum pagamento de Clara em outubro')).toBeOnTheScreen();
      expect(screen.queryByText(/Quando você registrar/)).not.toBeOnTheScreen();
      expect(screen.queryByText('Clara registrou em outubro')).not.toBeOnTheScreen();
    });

    it('Should keep the chosen person when the month changes', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();
      await user.press(screen.getByRole('button', { name: 'Ana' }));

      mockRealtime(
        { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.previousMonthWithEntries },
        threeTags,
        family,
      );
      await user.press(screen.getByRole('button', { name: 'Mês anterior' }));

      // Setembro só tem a Gráfica, do Bruno.
      expect(screen.getByRole('button', { name: 'Ana' })).toBeSelected();
      expect(screen.getByText('Nenhum pagamento de Ana em setembro')).toBeOnTheScreen();
    });
  });

  it('Should go back to "Você" when the chosen person leaves the list while the screen is open', async () => {
    const realtime = mockRealtime(october, threeTags, {
      service: allowedEmailListQueryService,
      scenario: allowedEmailListQueryScenarios.personRemovedWhileOpen,
    });
    await render(<PaymentsPage />);
    await userEvent.setup().press(screen.getByRole('button', { name: 'Clara' }));
    expect(screen.getByText('Nenhum pagamento de Clara em outubro')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(allowedEmailListQueryService));

    expect(screen.queryByRole('button', { name: 'Clara' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Você' })).toBeSelected();
    expect(screen.getByText('Você registrou em outubro')).toBeOnTheScreen();
  });

  it('Should wait for the tags before listing, so no entry shows as untagged', async () => {
    mockRealtime(october, { service: tagListQueryService, status: 'loading' }, family);
    await render(<PaymentsPage />);

    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();
    expect(screen.queryByText('Sem tag')).not.toBeOnTheScreen();
    expect(screen.queryByText('Farmácia')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the tags fail', async () => {
    mockRealtime(october, { service: tagListQueryService, status: 'error' }, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
  });

  it('Should open the new one-off bill screen when Nova conta avulsa is pressed', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Nova conta avulsa' }));

    expect(router.push).toHaveBeenCalledWith('/one-off-bills/new');
  });
});
