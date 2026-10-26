import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { useSharedReceipt } from '@/features/home/hooks/useSharedReceipt/useSharedReceipt';
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
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({ recurringBillListQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/features/home/hooks/useSharedReceipt/useSharedReceipt', () => ({ useSharedReceipt: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), dismissTo: jest.fn() } }));

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const noBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.noBills };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
const familyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthOfTheFamily };
const emptyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };
const paymentAddedWhileOpen = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.paymentAddedWhileOpen };

// O comprovante que o hook entrega: o `prepareReceipt` e o hook têm testes próprios, aqui só a tela o mostra.
const sharedPdf: IReceipt = {
  uri: 'file:///cache/pix-agua-outubro.pdf',
  name: 'pix-agua-outubro.pdf',
  contentType: 'application/pdf',
  sizeBytes: 64 * 1024,
  type: 'pdf',
  wasReduced: false,
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
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ShareReceiptPage', () => {
  it('Should show the shared receipt and the bills to pay of the month, with "Conta avulsa" last', async () => {
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    expect(screen.getByText('Qual conta você pagou?')).toBeOnTheScreen();
    expect(screen.getByText('Veio do compartilhamento · PDF · 64 KB')).toBeOnTheScreen();
    expect(screen.getByText('pix-agua-outubro.pdf')).toBeOnTheScreen();
    expect(screen.getByText('A pagar em outubro')).toBeOnTheScreen();
    expect(screen.getByText('R$ 119,90 · vence dia 15 · Serviços')).toBeOnTheScreen();
    expect(screen.getByText('R$ 98,00 · vence dia 20 · Serviços')).toBeOnTheScreen();
    expect(screen.queryByText('Aluguel')).toBeNull();

    const rows = screen.getAllByRole('button', { name: /^(Internet|Água|Conta avulsa)$/ });
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual(['Internet', 'Água', 'Conta avulsa']);
  });

  it('Should not let the shared receipt be changed on this screen', async () => {
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    expect(screen.queryByText('Trocar')).toBeNull();
    expect(screen.queryByText('Escolher')).toBeNull();
    expect(screen.queryByRole('button', { name: /^Comprovante/ })).toBeNull();
  });

  it('Should open the payment of the bill with the month and the shared flag', async () => {
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Registrar Água' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/recurring-bills/[id]/pay',
      params: { id: 'water', month: '2026-10', shared: '1' },
    });
  });

  it('Should open the new one-off bill with the shared flag', async () => {
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Conta avulsa' }));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/one-off-bills/new', params: { shared: '1' } });
  });

  it('Should say there is no bill to pay and still offer "Conta avulsa"', async () => {
    mockRealtime(noBills, threeTags, emptyMonth);
    await render(<ShareReceiptPage />);

    expect(screen.getByText('Nenhuma conta a pagar em outubro.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Conta avulsa' })).toBeOnTheScreen();
  });

  it('Should drop a bill another member pays while the screen is open', async () => {
    const realtime = mockRealtime(fiveBills, threeTags, paymentAddedWhileOpen);
    await render(<ShareReceiptPage />);
    expect(screen.getByRole('button', { name: 'Registrar Internet' })).toBeOnTheScreen();

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.queryByRole('button', { name: 'Registrar Internet' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Registrar Água' })).toBeOnTheScreen();
  });

  it('Should show the reason of a refused file and no list of bills', async () => {
    shareIs({ status: 'rejected', message: 'O PDF tem mais de uma página.' });
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    expect(screen.getByText('O PDF tem mais de uma página.')).toBeOnTheScreen();
    expect(screen.getByText('Compartilhe outro arquivo.')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar em outubro')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Conta avulsa' })).toBeNull();
  });

  it('Should show a loader and no list while the file is being read', async () => {
    shareIs({ status: 'resolving' });
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    expect(screen.getByLabelText('Lendo o arquivo')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar em outubro')).toBeNull();
    expect(screen.queryByText(/Veio do compartilhamento/)).toBeNull();
  });

  it.each([
    ['being read', { status: 'resolving' }],
    ['refused', { status: 'rejected', message: 'O PDF tem mais de uma página.' }],
  ] as const)('Should not read the month while the file is %s', async (_state, result) => {
    shareIs(result);
    mockRealtime(fiveBills, threeTags, familyMonth);
    jest.mocked(useRealtime).mockClear();
    await render(<ShareReceiptPage />);

    expect(useRealtime).not.toHaveBeenCalled();
  });

  it('Should go back to the home when nothing was shared', async () => {
    shareIs({ status: 'empty' });
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    expect(router.dismissTo).toHaveBeenCalledWith('/');
    expect(screen.queryByLabelText('Lendo o arquivo')).toBeNull();
  });

  it('Should show a loader in place of the bills, with "Conta avulsa", while the month loads', async () => {
    mockRealtime(
      { service: recurringBillListQueryService, status: 'loading' },
      threeTags,
      { service: entryMonthQueryService, status: 'loading' },
    );
    await render(<ShareReceiptPage />);

    expect(screen.getByLabelText('Carregando as contas')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Conta avulsa' })).toBeOnTheScreen();
    expect(screen.queryByText(/^Nenhuma conta a pagar/)).toBeNull();
  });

  describe('When the screen leaves the stack', () => {
    it('Should go to the home with the x', async () => {
      mockRealtime(fiveBills, threeTags, familyMonth);
      await render(<ShareReceiptPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Fechar' }));

      expect(router.dismissTo).toHaveBeenCalledWith('/');
    });

    it('Should discard the shared receipt, however the screen was left', async () => {
      setSharedReceipt(sharedPdf);
      mockRealtime(fiveBills, threeTags, familyMonth);
      const { unmount } = await render(<ShareReceiptPage />);
      expect(useSharedReceiptStore.getState().receipt).toBe(sharedPdf);

      await unmount();

      expect(useSharedReceiptStore.getState().receipt).toBeNull();
    });

    it('Should leave the Android back button to the stack', async () => {
      const addListener = jest.spyOn(BackHandler, 'addEventListener');
      mockRealtime(fiveBills, threeTags, familyMonth);
      await render(<ShareReceiptPage />);

      expect(addListener).not.toHaveBeenCalledWith('hardwareBackPress', expect.anything());
    });
  });

  it('Should keep the shared receipt when a bill is chosen', async () => {
    setSharedReceipt(sharedPdf);
    mockRealtime(fiveBills, threeTags, familyMonth);
    await render(<ShareReceiptPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Conta avulsa' }));

    expect(useSharedReceiptStore.getState().receipt).toBe(sharedPdf);
  });
});
