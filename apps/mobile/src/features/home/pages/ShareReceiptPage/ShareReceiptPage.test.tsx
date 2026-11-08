import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { useSharedReceipt } from '@/features/home/hooks/useSharedReceipt/useSharedReceipt';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { setSharedReceipt } from '@/shared/utils/sharedReceipt/setSharedReceipt';

import { ShareReceiptPage } from './ShareReceiptPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({ recurringBillListQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/features/home/hooks/useSharedReceipt/useSharedReceipt', () => ({ useSharedReceipt: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));

const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const noBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.noBills };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
const familyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthOfTheFamily };
const emptyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };
const paymentAddedWhileOpen = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.paymentAddedWhileOpen };
// Novembro, o próximo mês: o Condomínio já foi pago em outubro, e as outras quatro contas estão a pagar.
const novemberPaidEarly = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.nextMonthPaidEarly };

// O comprovante que o hook entrega: o `prepareReceipt` e o hook têm testes próprios, aqui só a tela o mostra.
const sharedPdf: IReceipt = {
  uri: 'file:///cache/pix-agua-outubro.pdf',
  name: 'pix-agua-outubro.pdf',
  contentType: 'application/pdf',
  sizeBytes: 64 * 1024,
  type: 'pdf',
  wasReduced: false,
  readAmountCents: null,
};

function shareIs(result: ReturnType<typeof useSharedReceipt>) {
  jest.mocked(useSharedReceipt).mockReturnValue(result);
}

beforeEach(() => {
  jest.clearAllMocks();
  useSharedReceiptStore.setState({ receipt: null });
  // "Hoje" fixo, de outubro de 2026; o relógio segue andando para as animações não travarem.
  jest.useFakeTimers({
    now: new Date(2026, 9, 25),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  shareIs({ status: 'ready', receipt: sharedPdf });
  // O Bruno compartilha: as contas que ele mesmo pagou não aparecem entre as pagas por outros.
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ShareReceiptPage', () => {
  it('Should show the shared receipt, "Conta avulsa" first, then the bills to pay of this month', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    expect(screen.getByText('Qual conta você pagou?')).toBeOnTheScreen();
    expect(screen.getByText('Veio do compartilhamento · PDF · 64 KB')).toBeOnTheScreen();
    expect(screen.getByText('pix-agua-outubro.pdf')).toBeOnTheScreen();
    const titles = screen.getAllByRole('header').map((node) => node.props.children);
    expect(titles.filter((title) => /^A pagar em/.test(title))).toEqual(['A pagar em outubro']);
    // O Condomínio já foi pago em outubro, e o Aluguel só está a pagar em novembro.
    expect(screen.queryByText('Condomínio')).toBeNull();
    expect(screen.queryByText('R$ 1.800,00 · vence dia 5')).toBeNull();

    // O rótulo de cada conta leva o nome da tag, que na tela é só a bolinha.
    const rows = screen.getAllByRole('button', { name: /^(Conta avulsa|Aluguel|Luz|Internet|Água)(, .+)?$/ });
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual([
      'Conta avulsa',
      'Internet, Serviços',
      'Água, Serviços',
      // Por último, as já pagas por outros: o Aluguel e a Luz da Ana.
      'Aluguel, Casa',
      'Luz, Serviços',
    ]);
  });

  it("Should show next month's bills after tapping Mês que vem", async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('tab', { name: 'Mês que vem' }));

    expect(screen.getByText('A pagar em novembro')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar em outubro')).toBeNull();
    // O Aluguel foi pago em outubro e está a pagar em novembro; o Condomínio já foi pago antes.
    expect(screen.getByText('R$ 1.800,00 · vence dia 5')).toBeOnTheScreen();
    expect(screen.queryByText('Condomínio')).toBeNull();
  });

  it('Should mark the chosen pill as selected', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);
    const user = userEvent.setup();

    expect(screen.getByRole('tab', { name: 'Este mês', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Mês que vem', selected: false })).toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'Mês que vem' }));

    expect(screen.getByRole('tab', { name: 'Mês que vem', selected: true })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Este mês', selected: false })).toBeOnTheScreen();
  });

  it('Should offer only this month and the next', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);
    const pillNames = () => screen.getAllByRole('tab').map((pill) => pill.props.accessibilityLabel);

    expect(pillNames()).toEqual(['Este mês', 'Mês que vem']);

    await userEvent.setup().press(screen.getByRole('tab', { name: 'Mês que vem' }));

    expect(pillNames()).toEqual(['Este mês', 'Mês que vem']);
  });

  it('Should keep this month across midnight with the screen open', async () => {
    jest.setSystemTime(new Date(2026, 9, 31, 23, 59));
    const realtime = mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    jest.setSystemTime(new Date(2026, 10, 1, 0, 1));
    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.getByRole('tab', { name: 'Este mês', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('A pagar em outubro')).toBeOnTheScreen();
  });

  it('Should not let the shared receipt be changed on this screen', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    expect(screen.queryByText('Trocar')).toBeNull();
    expect(screen.queryByText('Escolher')).toBeNull();
  });

  it('Should open the shared receipt full screen on a tap, to check the amount', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Comprovante: pix-agua-outubro.pdf. Ver' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/receipt-preview',
      params: { uri: 'file:///cache/pix-agua-outubro.pdf', name: 'pix-agua-outubro.pdf', type: 'pdf' },
    });
  });

  it('Should open the payment of the bill with the month of its list and the shared flag', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Registrar Água' }));
    await user.press(screen.getByRole('tab', { name: 'Mês que vem' }));
    await user.press(screen.getByRole('button', { name: 'Registrar Água' }));

    expect(router.push).toHaveBeenNthCalledWith(1, {
      pathname: '/recurring-bills/[id]/pay',
      params: { id: 'water', month: '2026-10', shared: '1' },
    });
    expect(router.push).toHaveBeenNthCalledWith(2, {
      pathname: '/recurring-bills/[id]/pay',
      params: { id: 'water', month: '2026-11', shared: '1' },
    });
  });

  it('Should open the new one-off bill with the shared flag', async () => {
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Conta avulsa' }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/one-off-bills/new', params: { shared: '1' } });
  });

  it('Should say there is no bill to pay and still offer "Conta avulsa"', async () => {
    mockRealtime(family, noBills, threeTags, emptyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    expect(screen.getByText('Nenhuma conta a pagar em outubro.')).toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole('tab', { name: 'Mês que vem' }));

    expect(screen.getByText('Nenhuma conta a pagar em novembro.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Conta avulsa' })).toBeOnTheScreen();
  });

  it('Should drop a bill another member pays while the screen is open', async () => {
    const realtime = mockRealtime(family, fiveBills, threeTags, paymentAddedWhileOpen, novemberPaidEarly);
    await render(<ShareReceiptPage />);
    expect(screen.getByRole('button', { name: 'Registrar Internet' })).toBeOnTheScreen();

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.queryByRole('button', { name: 'Registrar Internet' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Registrar Água' })).toBeOnTheScreen();

    // O pagamento é da Internet de outubro: a de novembro continua a pagar.
    await userEvent.setup().press(screen.getByRole('tab', { name: 'Mês que vem' }));

    expect(screen.getByRole('button', { name: 'Registrar Internet' })).toBeOnTheScreen();
  });

  it('Should show the reason of a refused file and no list of bills', async () => {
    shareIs({ status: 'rejected', message: 'O PDF passa de 900 KB. Escolha outro arquivo.' });
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    expect(screen.getByText('O PDF passa de 900 KB. Escolha outro arquivo.')).toBeOnTheScreen();
    expect(screen.getByText('Compartilhe outro arquivo.')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar em outubro')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Conta avulsa' })).toBeNull();
  });

  it('Should show a loader and no list while the file is being read', async () => {
    shareIs({ status: 'resolving' });
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    expect(screen.getByLabelText('Lendo o arquivo')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar em outubro')).toBeNull();
    expect(screen.queryByText(/Veio do compartilhamento/)).toBeNull();
  });

  it.each([
    ['being read', { status: 'resolving' }],
    ['refused', { status: 'rejected', message: 'O PDF passa de 900 KB. Escolha outro arquivo.' }],
  ] as const)('Should not read the month while the file is %s', async (_state, result) => {
    shareIs(result);
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    jest.mocked(useRealtime).mockClear();
    await render(<ShareReceiptPage />);

    expect(useRealtime).not.toHaveBeenCalled();
  });

  it('Should go back to the home when nothing was shared', async () => {
    shareIs({ status: 'empty' });
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    expect(router.dismissTo).toHaveBeenCalledWith('/');
    expect(screen.queryByLabelText('Lendo o arquivo')).toBeNull();
  });

  it('Should show a loader in place of the bills, with "Conta avulsa", while the month loads', async () => {
    mockRealtime(family, { service: recurringBillListQueryService, status: 'loading' }, threeTags, {
      service: entryMonthQueryService,
      status: 'loading',
    });
    await render(<ShareReceiptPage />);

    expect(screen.getAllByLabelText('Carregando as contas')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Conta avulsa' })).toBeOnTheScreen();
    expect(screen.queryByText(/^Nenhuma conta a pagar/)).toBeNull();
  });

  describe('When the screen leaves the stack', () => {
    it('Should go to the home with the x', async () => {
      mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
      await render(<ShareReceiptPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Fechar' }));

      expect(router.dismissTo).toHaveBeenCalledWith('/');
    });

    it('Should discard the shared receipt, however the screen was left', async () => {
      setSharedReceipt(sharedPdf);
      mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
      const { unmount } = await render(<ShareReceiptPage />);
      expect(useSharedReceiptStore.getState().receipt).toBe(sharedPdf);

      await unmount();

      expect(useSharedReceiptStore.getState().receipt).toBeNull();
    });

    it('Should leave the Android back button to the stack', async () => {
      const addListener = jest.spyOn(BackHandler, 'addEventListener');
      mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
      await render(<ShareReceiptPage />);

      expect(addListener).not.toHaveBeenCalledWith('hardwareBackPress', expect.anything());
    });
  });

  it('Should keep the shared receipt when a bill is chosen', async () => {
    setSharedReceipt(sharedPdf);
    mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Conta avulsa' }));

    expect(useSharedReceiptStore.getState().receipt).toBe(sharedPdf);
  });

  describe('Bills paid by others', () => {
    it('Should list bills paid by others below the bills to pay when sharing', async () => {
      mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
      await render(<ShareReceiptPage />);

      // Em outubro, a Ana pagou o Aluguel e a Luz; o Condomínio de novembro é do próprio Bruno.
      const titles = screen.getAllByRole('header').map((node) => node.props.children);
      expect(titles.slice(-1)).toEqual(['Já pagas por outros em outubro']);
      expect(screen.getByText('R$ 1.800,00 · pago por Ana')).toBeOnTheScreen();
      expect(screen.getByText('R$ 187,35 · pago por Ana')).toBeOnTheScreen();
      expect(screen.queryByText(/pago por Bruno/)).not.toBeOnTheScreen();
    });

    it('Should show the bills paid by others of the chosen month only', async () => {
      // A Ana compartilha: em outubro o Condomínio e a geladeira são do Bruno, e em novembro só o Condomínio.
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
      mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
      await render(<ShareReceiptPage />);
      const user = userEvent.setup();

      expect(screen.getByText('Já pagas por outros em outubro')).toBeOnTheScreen();
      expect(screen.queryByText('Já pagas por outros em novembro')).toBeNull();
      await user.press(screen.getByRole('button', { name: 'Contribuir em Conserto da geladeira' }));
      expect(router.push).toHaveBeenLastCalledWith({
        pathname: '/entries/[id]/contribute',
        params: { id: 'fridge', shared: '1' },
      });

      await user.press(screen.getByRole('tab', { name: 'Mês que vem' }));

      expect(screen.getByText('Já pagas por outros em novembro')).toBeOnTheScreen();
      expect(screen.queryByText('Já pagas por outros em outubro')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Contribuir em Conserto da geladeira' })).toBeNull();
      await user.press(screen.getByRole('button', { name: 'Contribuir em Condomínio' }));
      expect(router.push).toHaveBeenLastCalledWith({
        pathname: '/entries/[id]/contribute',
        params: { id: '2026-11_condo', shared: '1' },
      });
    });

    it('Should open the contribution to the bill with the shared receipt', async () => {
      mockRealtime(family, fiveBills, threeTags, familyMonth, novemberPaidEarly);
      await render(<ShareReceiptPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Contribuir em Luz' }));

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/entries/[id]/contribute',
        params: { id: '2026-10_electricity', shared: '1' },
      });
    });

    it('Should leave out a bill with nothing left to receive', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
      const fullyContributed = {
        service: entryMonthQueryService,
        scenario: entryMonthQueryScenarios.monthWithFullyContributedPayment,
      };
      mockRealtime(family, fiveBills, threeTags, fullyContributed, novemberPaidEarly);
      await render(<ShareReceiptPage />);

      expect(screen.queryByText('Já pagas por outros em outubro')).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Contribuir em Luz' })).not.toBeOnTheScreen();
    });
  });
});
