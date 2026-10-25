import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { MyPaymentsPage } from './MyPaymentsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
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

describe('MyPaymentsPage', () => {
  it('Should list only the entries of the signed-in member, with the date and the tag', async () => {
    mockRealtime(october, threeTags);
    await render(<MyPaymentsPage />);

    expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa · Casa')).toBeOnTheScreen();
    expect(screen.queryByText('Mercado')).not.toBeOnTheScreen();
    expect(screen.queryByText('Estacionamento')).not.toBeOnTheScreen();
  });

  it('Should show the sum of the member entries and their share of the family month', async () => {
    mockRealtime(october, threeTags);
    await render(<MyPaymentsPage />);

    expect(screen.getByText('Você registrou em outubro')).toBeOnTheScreen();
    // Bruno: R$ 89,90 de R$ 354,90 da família.
    expect(screen.getByText('1 lançamento · 25% do que a família pagou')).toBeOnTheScreen();
    expect(screen.getAllByText('R$ 89,90')).toHaveLength(2);
  });

  it('Should sum all the entries of the member, not only the first, against the whole family month', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithTwoEntriesOfTheMember },
      threeTags
    );
    await render(<MyPaymentsPage />);

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
      threeTags
    );
    await render(<MyPaymentsPage />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('pago em 15/10 · previsto R$ 119,90')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa · Casa')).toBeOnTheScreen();
    // Bruno: R$ 125,00 + R$ 89,90.
    expect(screen.getByText('R$ 214,90')).toBeOnTheScreen();
    expect(screen.getByText('2 lançamentos · 100% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should keep the expected amount of the payment when the bill changed afterwards', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPaymentOfAlteredBill },
      threeTags
    );
    await render(<MyPaymentsPage />);

    expect(screen.getByText('pago em 10/10 · previsto R$ 250,00')).toBeOnTheScreen();
  });

  it('Should show only the date for an entry without tag', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.previousMonthWithEntries },
      threeTags
    );
    jest.setSystemTime(new Date(2026, 8, 15));
    await render(<MyPaymentsPage />);

    expect(screen.getByText('30/09 · avulsa')).toBeOnTheScreen();
  });

  it('Should show the empty state without the total card when the member has no entry in the month', async () => {
    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth }, threeTags);
    await render(<MyPaymentsPage />);

    expect(screen.getByText('Nenhum pagamento seu em outubro')).toBeOnTheScreen();
    expect(screen.getByText('Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.')).toBeOnTheScreen();
    expect(screen.queryByText('Você registrou em outubro')).not.toBeOnTheScreen();
  });

  it('Should read the previous month and enable the next one when the previous month is pressed', async () => {
    mockRealtime(october, threeTags);
    await render(<MyPaymentsPage />);
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled();

    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.previousMonthWithEntries }, threeTags);
    await user.press(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(screen.getByText('Setembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Gráfica')).toBeOnTheScreen();
    expect(screen.getByText('Você registrou em setembro')).toBeOnTheScreen();
    expect(screen.queryByText('Farmácia')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeEnabled();
  });

  it('Should show neither the list nor the empty state while the month loads', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'loading' }, threeTags);
    await render(<MyPaymentsPage />);

    expect(screen.queryByText('Você registrou em outubro')).not.toBeOnTheScreen();
    expect(screen.queryByText('Nenhum pagamento seu em outubro')).not.toBeOnTheScreen();
    expect(screen.queryByText('Não deu para carregar a lista.')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the read fails', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'error' }, threeTags);
    await render(<MyPaymentsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(screen.queryByText('Nenhum pagamento seu em outubro')).not.toBeOnTheScreen();
  });

  it('Should open the new one-off bill screen when Nova conta avulsa is pressed', async () => {
    mockRealtime(october, threeTags);
    await render(<MyPaymentsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Nova conta avulsa' }));

    expect(router.push).toHaveBeenCalledWith('/one-off-bills/new');
  });
});
