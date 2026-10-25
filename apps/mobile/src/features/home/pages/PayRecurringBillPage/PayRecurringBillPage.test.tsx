import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { payRecurringBillService } from '@/shared/services/entry/add/payRecurringBillService';
import {
  payRecurringBillRejectedScenarios,
  payRecurringBillScenarios,
} from '@/shared/services/entry/add/payRecurringBillService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';
import { clearSharedReceipt } from '@/shared/utils/sharedReceipt/clearSharedReceipt';

import { PayRecurringBillPage } from './PayRecurringBillPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('@/shared/services/entry/add/payRecurringBillService', () => ({ payRecurringBillService: jest.fn() }));
jest.mock('@/shared/utils/file/pickReceiptFile', () => ({ pickReceiptFile: jest.fn() }));
jest.mock('@/shared/utils/file/prepareReceipt', () => ({ prepareReceipt: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

const scenario = payRecurringBillScenarios.memberPaysBill;
const [paymentOfScenario] = scenario.input;
const pickedFile = { uri: 'file:///x', name: 'x.png', contentType: 'image/png', sizeBytes: 10 };
const RECEIPT_BUTTON = 'Comprovante: Nenhum arquivo anexado. Escolher';
const SUBMIT = 'Registrar pagamento';

beforeEach(() => {
  jest.clearAllMocks();
  // O relógio segue andando para as animações dos campos não travarem nem sair do `act`.
  jest.useFakeTimers({
    now: new Date(2026, 9, 25),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
  jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
  jest.mocked(prepareReceipt).mockResolvedValue(paymentOfScenario.receipt);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PayRecurringBillPage', () => {
  let realtime: ReturnType<typeof mockRealtime>;

  async function renderPage(
    id = paymentOfScenario.bill.id,
    { month, entriesScenario = entryMonthQueryScenarios.emptyMonth, shared } = { month: paymentOfScenario.month } as {
      month?: string;
      entriesScenario?: (typeof entryMonthQueryScenarios)[keyof typeof entryMonthQueryScenarios];
      shared?: string;
    },
  ) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id, month, shared });
    realtime = mockRealtime(
      { service: entryMonthQueryService, scenario: entriesScenario },
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills },
      { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags },
      { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList },
    );
    await render(<PayRecurringBillPage />);
    // O rótulo do campo já preenchido sobe animado ao abrir: a animação termina dentro do `act`.
    await act(async () => {
      await jest.advanceTimersByTimeAsync(500);
    });
    return userEvent.setup();
  }

  it('Should show the bill of the month with its tag, due day and expected amount', async () => {
    await renderPage();

    expect(screen.getByText('Conta de outubro')).toBeOnTheScreen();
    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('Serviços')).toBeOnTheScreen();
    expect(screen.getByText('vence dia 15 · previsto R$ 119,90')).toBeOnTheScreen();
    expect(screen.getByText('Veio do valor previsto. Corrija se pagou outro valor.')).toBeOnTheScreen();
  });

  it('Should space the blocks of the form by 24, as in the design', async () => {
    await renderPage();

    // O primeiro ancestral do botão com `gap` é a coluna do formulário.
    let node = screen.getByRole('button', { name: SUBMIT }).parent;
    while (node && StyleSheet.flatten(node.props.style)?.gap === undefined) node = node.parent;

    expect(StyleSheet.flatten(node?.props.style).gap).toBe(24);
  });

  it('Should register the payment with the expected amount, say so and go back', async () => {
    mockServiceScenario(payRecurringBillService, scenario);
    const user = await renderPage();

    expect(screen.getByDisplayValue('R$ 119,90')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(payRecurringBillService).toHaveBeenCalledWith(paymentOfScenario);
    expect(showToast).toHaveBeenCalledWith('Pagamento registrado.', 'success');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  // O próprio pagamento chega pela leitura do mês antes de a tela voltar: ela não troca o formulário pela recusa.
  it('Should keep the form, not the already-paid text, when its own payment arrives after the submit', async () => {
    mockServiceScenario(payRecurringBillService, scenario);
    const user = await renderPage(paymentOfScenario.bill.id, {
      month: paymentOfScenario.month,
      entriesScenario: entryMonthQueryScenarios.paymentAddedWhileOpen,
    });
    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));
    expect(router.back).toHaveBeenCalledTimes(1);

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.queryByText('Esta conta já foi paga neste mês.')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: SUBMIT })).toBeOnTheScreen();
  });

  it('Should send the corrected amount when the person changes it', async () => {
    const corrected = payRecurringBillScenarios.memberPaysWithCorrectedAmount;
    mockServiceScenario(payRecurringBillService, corrected);
    const user = await renderPage();

    const field = screen.getByLabelText('Valor pago');
    await user.clear(field);
    await user.type(field, String(corrected.input[0].amountCents));
    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(screen.getByDisplayValue('R$ 125,50')).toBeOnTheScreen();
    expect(payRecurringBillService).toHaveBeenCalledWith(corrected.input[0]);
  });

  it('Should refuse a payment without receipt, say so and not call the service', async () => {
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByText('Anexe o comprovante.')).toBeOnTheScreen();
    expect(payRecurringBillService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should refuse an emptied amount', async () => {
    const user = await renderPage();

    await user.clear(screen.getByLabelText('Valor pago'));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
    expect(payRecurringBillService).not.toHaveBeenCalled();
  });

  it('Should say the payment stays in the name of the person and not ask who paid', async () => {
    await renderPage();

    expect(
      screen.getByText('Fica no seu nome, Bruno. Só você poderá alterar ou excluir este pagamento.'),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Quem pagou')).not.toBeOnTheScreen();
    expect(screen.queryByText('Quem pagou')).not.toBeOnTheScreen();
  });

  it('Should show the toast and stay on the screen when another member already paid', async () => {
    const rejected = payRecurringBillRejectedScenarios.billAlreadyPaidByAnother;
    mockServiceRejection(payRecurringBillService, rejected);
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(payRecurringBillService).toHaveBeenCalledWith(rejected.input[0]);
    expect(showToast).toHaveBeenCalledWith(rejected.result.userMessage, 'error');
    expect(router.back).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('R$ 119,90')).toBeOnTheScreen();
    expect(screen.getByText(paymentOfScenario.receipt.name)).toBeOnTheScreen();
  });

  it('Should call the service once when the button is pressed twice while saving', async () => {
    let resolveSave!: () => void;
    jest.mocked(payRecurringBillService).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(payRecurringBillService).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave());
  });

  it('Should say the bill no longer exists, without the form, when it is not in the list', async () => {
    await renderPage('deleted-bill');

    expect(screen.getByText('Esta conta não existe mais.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: SUBMIT })).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('Valor pago')).not.toBeOnTheScreen();
  });

  describe.each([
    ['a future month', '2026-11'],
    ['a month far in the future', '2027-01'],
    ['a text that is not a month', 'outubro'],
    ['no month', undefined],
    ['a month before the bill starts', '2025-12'],
  ])('with %s', (_case, month) => {
    it('Should say the bill is not to pay, without the form', async () => {
      await renderPage(paymentOfScenario.bill.id, { month });

      expect(screen.getByText('Esta conta não está a pagar neste mês.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: SUBMIT })).not.toBeOnTheScreen();
      expect(screen.queryByLabelText('Valor pago')).not.toBeOnTheScreen();
    });
  });

  it('Should say the bill was already paid in the month, without the form', async () => {
    await renderPage(paymentOfScenario.bill.id, {
      month: paymentOfScenario.month,
      entriesScenario: entryMonthQueryScenarios.monthWithPayment,
    });

    expect(screen.getByText('Esta conta já foi paga neste mês.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: SUBMIT })).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('Valor pago')).not.toBeOnTheScreen();
  });

  describe('With the shared receipt in the store', () => {
    const sharedOpening = { month: paymentOfScenario.month, shared: '1' };

    beforeEach(() => {
      useSharedReceiptStore.setState({ receipt: paymentOfScenario.receipt });
    });

    afterEach(async () => {
      // A tela ainda está montada aqui: a limpeza do store vai dentro do `act`.
      await act(async () => {
        clearSharedReceipt();
      });
    });

    it('Should show the shared file in the receipt field when the page opens shared', async () => {
      await renderPage(undefined, sharedOpening);

      expect(screen.getByText(paymentOfScenario.receipt.name)).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: RECEIPT_BUTTON })).not.toBeOnTheScreen();
    });

    it('Should register the payment with the shared receipt and dismiss to the home, leaving the store to the share screen', async () => {
      mockServiceScenario(payRecurringBillService, scenario);
      const user = await renderPage(undefined, sharedOpening);

      await user.press(screen.getByRole('button', { name: SUBMIT }));

      expect(payRecurringBillService).toHaveBeenCalledWith(paymentOfScenario);
      expect(router.dismissTo).toHaveBeenCalledWith('/');
      expect(router.back).not.toHaveBeenCalled();
      expect(useSharedReceiptStore.getState().receipt).toEqual(paymentOfScenario.receipt);
    });

    it('Should stay on the screen with the shared file and the store when the service refuses', async () => {
      const rejected = payRecurringBillRejectedScenarios.billAlreadyPaidByAnother;
      mockServiceRejection(payRecurringBillService, rejected);
      const user = await renderPage(undefined, sharedOpening);

      await user.press(screen.getByRole('button', { name: SUBMIT }));

      expect(showToast).toHaveBeenCalledWith(rejected.result.userMessage, 'error');
      expect(router.dismissTo).not.toHaveBeenCalled();
      expect(screen.getByText(paymentOfScenario.receipt.name)).toBeOnTheScreen();
      expect(useSharedReceiptStore.getState().receipt).toEqual(paymentOfScenario.receipt);
    });

    it('Should let the person choose the file and leave with dismissTo when the shared store is empty', async () => {
      mockServiceScenario(payRecurringBillService, scenario);
      useSharedReceiptStore.setState({ receipt: null });
      const user = await renderPage(undefined, sharedOpening);

      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
      await user.press(screen.getByRole('button', { name: SUBMIT }));

      expect(payRecurringBillService).toHaveBeenCalledWith(paymentOfScenario);
      expect(router.dismissTo).toHaveBeenCalledWith('/');
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should keep the store and start the receipt field empty when the page opens without the shared param', async () => {
      await renderPage();

      expect(screen.getByRole('button', { name: RECEIPT_BUTTON })).toBeOnTheScreen();
      expect(screen.queryByText(paymentOfScenario.receipt.name)).not.toBeOnTheScreen();
      expect(useSharedReceiptStore.getState().receipt).toEqual(paymentOfScenario.receipt);
    });
  });
});
