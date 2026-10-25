import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { getSharedPayloads } from 'expo-sharing';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { HomePage } from './HomePage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({ recurringBillListQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
// O compartilhamento que o Android deixou para o app, lido pelo Início ao abrir.
jest.mock('expo-sharing', () => ({ getSharedPayloads: jest.fn(() => []) }));

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const noBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.noBills };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const renamedFamily = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyWithRenamedMember };
const familyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthOfTheFamily };
const emptyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };

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

describe('HomePage', () => {
  describe('A file shared to the app', () => {
    it('Should open the share screen when a shared file is waiting', async () => {
      jest.mocked(getSharedPayloads).mockReturnValue([
        { value: 'content://x/pix.pdf', shareType: 'file', mimeType: 'application/pdf' },
      ] as never);
      mockRealtime(fiveBills, threeTags, family, familyMonth);

      await render(<HomePage />);

      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith('/share-receipt');
    });

    it('Should not open the share screen when nothing was shared', async () => {
      jest.mocked(getSharedPayloads).mockReturnValue([]);
      mockRealtime(fiveBills, threeTags, family, familyMonth);

      await render(<HomePage />);

      expect(router.push).not.toHaveBeenCalled();
    });
  });

  it('Should show the same numbers to Ana and to Bruno', async () => {
    const numbers = ['R$ 217,90', 'R$ 2.787,35', 'R$ 3.005,25', '2 de 6 contas'];
    const found: string[][] = [];

    for (const scenario of [signInWithFakeGoogleScenarios.adminSignsIn, signInWithFakeGoogleScenarios.memberSignsIn]) {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(scenario));
      mockRealtime(fiveBills, threeTags, family, familyMonth);
      const { unmount } = await render(<HomePage />);
      found.push(numbers.filter((text) => screen.queryAllByText(text).length > 0));
      await unmount();
    }

    expect(found[0]).toEqual(numbers);
    expect(found[1]).toEqual(numbers);
  });

  it('Should count the payments and the one-off bill as paid and the bills without payment as to pay', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByText('Outubro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Falta pagar')).toBeOnTheScreen();
    expect(screen.getByText('2 de 6 contas')).toBeOnTheScreen();
    expect(screen.getByText('2 contas · R$ 217,90')).toBeOnTheScreen();
    expect(screen.getByText('4 contas · R$ 2.787,35')).toBeOnTheScreen();
    expect(screen.getByText('R$ 3.005,25')).toBeOnTheScreen();
  });

  it('Should list the bills to pay by expected amount and due day, before the paid ones', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByText('R$ 119,90 · vence dia 15 · Serviços')).toBeOnTheScreen();
    expect(screen.getByText('R$ 98,00 · vence dia 20 · Serviços')).toBeOnTheScreen();
    const titles = screen.getAllByRole('header').map((node) => node.props.children);
    expect(titles).toEqual(['A pagar', 'Pagas']);
  });

  it('Should list the paid ones by day, with who paid, the tag or the expected amount', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByText('dia 5 · Ana · Casa')).toBeOnTheScreen();
    expect(screen.getByText('dia 8 · Bruno · Casa')).toBeOnTheScreen();
    expect(screen.getByText('dia 10 · Ana · previsto R$ 210,00')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa · Bruno · Casa')).toBeOnTheScreen();
    const names = screen
      .getAllByText(/^(Aluguel|Condomínio|Luz|Conserto da geladeira)$/)
      .map((node) => node.props.children);
    expect(names).toEqual(['Aluguel', 'Condomínio', 'Luz', 'Conserto da geladeira']);
  });

  it('Should keep the due day and the expected amount of the payment when the bill changed afterwards', async () => {
    mockRealtime(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.monthWithPaymentOfAlteredBill,
    });
    await render(<HomePage />);

    expect(screen.getByText('dia 3 · Bruno · previsto R$ 250,00')).toBeOnTheScreen();
    expect(screen.queryByText('dia 10 · Bruno · previsto R$ 210,00')).not.toBeOnTheScreen();
  });

  it('Should split what was paid by tag, with what is still to pay', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByRole('tab', { name: 'Por tag', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.600,00')).toBeOnTheScreen();
    // Na linha da tag Serviços e na da Luz.
    expect(screen.getAllByText('R$ 187,35')).toHaveLength(2);
    expect(screen.getByText('e mais R$ 217,90 a pagar')).toBeOnTheScreen();
  });

  it('Should split what was paid by member with the current name of the person', async () => {
    mockRealtime(fiveBills, threeTags, renamedFamily, familyMonth);
    await render(<HomePage />);

    await userEvent.setup().press(screen.getByRole('tab', { name: 'Por membro' }));

    expect(screen.getByRole('tab', { name: 'Por membro', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('Ana')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.987,35')).toBeOnTheScreen();
    expect(screen.getByText('Bruno')).toBeOnTheScreen();
    expect(screen.getByText('R$ 800,00')).toBeOnTheScreen();
  });

  it('Should show the numbers of the previous month when the month is changed', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);
    mockRealtime(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.previousMonthWithEntries,
    });

    await userEvent.setup().press(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(screen.getByText('Setembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.677,90')).toBeOnTheScreen();
    expect(screen.getByText('5 de 6 contas')).toBeOnTheScreen();
    expect(screen.getByText('1 conta · R$ 30,00')).toBeOnTheScreen();
  });

  it('Should show all bills to pay and a zero paid when the month has no entries', async () => {
    mockRealtime(fiveBills, threeTags, family, emptyMonth);
    await render(<HomePage />);

    // No centro do anel e no total do mês.
    expect(screen.getAllByText('R$ 2.677,90')).toHaveLength(2);
    expect(screen.getByText('5 de 5 contas')).toBeOnTheScreen();
    expect(screen.queryByText('Pagas')).not.toBeOnTheScreen();
  });

  it('Should show the closed month when every bill is paid', async () => {
    mockRealtime(
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billWithDeletedTag },
      threeTags,
      family,
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPayment },
    );
    await render(<HomePage />);

    expect(screen.getByText('Mês fechado')).toBeOnTheScreen();
    expect(screen.getByText('Tudo pago')).toBeOnTheScreen();
  });

  it('Should offer to register the bills when the family has none', async () => {
    mockRealtime(noBills, threeTags, family, emptyMonth);
    await render(<HomePage />);

    expect(screen.getByText('Sem contas')).toBeOnTheScreen();
    expect(screen.getByText('Nenhuma conta recorrente ainda')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar')).not.toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Cadastrar contas recorrentes' }));

    expect(router.push).toHaveBeenCalledWith('/recurring-bills');
  });

  it('Should open the payment of the bill with the month of the screen when Registrar is pressed', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Registrar Internet' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/recurring-bills/[id]/pay',
      params: { id: 'internet', month: '2026-10' },
    });
  });

  it('Should open the details of a paid entry when its row is pressed', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Aluguel' }));
    await user.press(screen.getByRole('button', { name: 'Conserto da geladeira' }));

    expect(router.push).toHaveBeenNthCalledWith(1, { pathname: '/entries/[id]', params: { id: '2026-10_rent' } });
    expect(router.push).toHaveBeenNthCalledWith(2, { pathname: '/entries/[id]', params: { id: 'fridge' } });
  });

  it('Should bring a bill back to to pay when its payment is deleted with the screen open', async () => {
    const realtime = mockRealtime(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.paymentDeletedWhileOpen,
    });
    await render(<HomePage />);
    expect(screen.queryByRole('button', { name: 'Registrar Internet' })).not.toBeOnTheScreen();
    expect(screen.getByText('dia 15 · Ana · Casa')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.getByRole('button', { name: 'Registrar Internet' })).toBeOnTheScreen();
    expect(screen.queryByText('dia 15 · Ana · Casa')).not.toBeOnTheScreen();
  });

  it('Should not offer to add a one-off bill', async () => {
    mockRealtime(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.queryByText('Nova conta avulsa')).not.toBeOnTheScreen();
  });

  it('Should show nothing of the month while it is loading', async () => {
    mockRealtime(
      { service: recurringBillListQueryService, status: 'loading' },
      threeTags,
      family,
      { service: entryMonthQueryService, status: 'loading' },
    );
    await render(<HomePage />);

    expect(screen.queryByText('Falta pagar')).not.toBeOnTheScreen();
    expect(screen.queryByText('Sem contas')).not.toBeOnTheScreen();
  });

  it('Should say the month could not be loaded when the read fails', async () => {
    mockRealtime(fiveBills, threeTags, family, { service: entryMonthQueryService, status: 'error' });
    await render(<HomePage />);

    expect(screen.getByText('Não deu para carregar o mês.')).toBeOnTheScreen();
  });

  it('Should move a bill from to pay to paid when its payment arrives with the screen open', async () => {
    const realtime = mockRealtime(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.paymentAddedWhileOpen,
    });
    await render(<HomePage />);
    expect(screen.getByRole('button', { name: 'Registrar Internet' })).toBeOnTheScreen();
    expect(screen.queryByText('dia 15 · Ana')).not.toBeOnTheScreen();

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.queryByRole('button', { name: 'Registrar Internet' })).not.toBeOnTheScreen();
    expect(screen.getByText('dia 15 · Ana · Casa')).toBeOnTheScreen();
  });
});
