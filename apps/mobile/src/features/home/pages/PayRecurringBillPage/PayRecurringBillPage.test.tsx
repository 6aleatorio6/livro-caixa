import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { addContributionService } from '@/shared/services/entry/add/addContributionService';
import { addContributionScenarios } from '@/shared/services/entry/add/addContributionService.scenarios';
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
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('@/shared/services/entry/add/payRecurringBillService', () => ({ payRecurringBillService: jest.fn() }));
jest.mock('@/shared/services/entry/add/addContributionService', () => ({ addContributionService: jest.fn() }));
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
const EXPECTED_NOTE = 'Veio do valor previsto. Corrija se pagou outro valor.';
const RECEIPT_NOTE = 'Veio do comprovante. Corrija se pagou outro valor.';

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
    { month, entriesScenario = entryMonthQueryScenarios.emptyMonth, shared, attach } = {
      month: paymentOfScenario.month,
    } as {
      month?: string;
      entriesScenario?: (typeof entryMonthQueryScenarios)[keyof typeof entryMonthQueryScenarios];
      shared?: string;
      attach?: string;
    },
  ) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id, month, shared, attach });
    realtime = mockRealtime(
      { service: entryMonthQueryService, scenario: entriesScenario },
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills },
      { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags },
      { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList },
      { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList },
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

  describe('Paguei só uma parte', () => {
    const SWITCH = { name: 'Paguei só uma parte' };

    it('Should turn the switch on and disable it below 30% of the expected amount', async () => {
      const user = await renderPage();

      // A Internet prevista em R$ 119,90: 30% são R$ 35,97, e R$ 30,00 fica abaixo.
      const field = screen.getByLabelText('Valor pago');
      await user.clear(field);
      await user.type(field, '3000');

      expect(screen.getByRole('switch', SWITCH)).toBeChecked();
      expect(screen.getByRole('switch', SWITCH)).toBeDisabled();
      expect(screen.getByText('Abaixo de 30% do previsto (R$ 35,97), só pode ser uma contribuição.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Registrar contribuição' })).toBeOnTheScreen();
      expect(screen.getByLabelText('Quanto você pagou')).toBeOnTheScreen();
    });

    it('Should leave the switch free at 30% of the expected amount', async () => {
      const user = await renderPage();

      const field = screen.getByLabelText('Valor pago');
      await user.clear(field);
      await user.type(field, '3597');

      expect(screen.getByRole('switch', SWITCH)).not.toBeChecked();
      expect(screen.getByRole('switch', SWITCH)).toBeEnabled();
    });

    it('Should send a contribution when the switch is on, say so and go back', async () => {
      const contribution = addContributionScenarios.memberContributesToMonthWithoutPayment;
      const [input] = contribution.input;
      mockServiceScenario(addContributionService, contribution);
      jest.mocked(prepareReceipt).mockResolvedValue(input.receipt);
      const user = await renderPage();

      const field = screen.getByLabelText('Valor pago');
      await user.clear(field);
      await user.type(field, String(input.amountCents));
      await user.press(screen.getByRole('switch', SWITCH));
      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
      await user.press(screen.getByRole('button', { name: 'Registrar contribuição' }));

      expect(addContributionService).toHaveBeenCalledWith(...contribution.input);
      expect(payRecurringBillService).not.toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith('Contribuição registrada.', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should send a payment when the switch is turned on and off again', async () => {
      mockServiceScenario(payRecurringBillService, scenario);
      const user = await renderPage();

      await user.press(screen.getByRole('switch', SWITCH));
      await user.press(screen.getByRole('switch', SWITCH));
      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
      await user.press(screen.getByRole('button', { name: SUBMIT }));

      expect(payRecurringBillService).toHaveBeenCalledWith(paymentOfScenario);
      expect(addContributionService).not.toHaveBeenCalled();
    });
  });

  // A Luz de novembro tem R$ 100,00 da Ana de R$ 200,00 previstos no pagamento sem dono (a conta de hoje prevê R$ 210,00).
  describe('A month with contributions', () => {
    const openMonth = { month: '2026-11', entriesScenario: entryMonthQueryScenarios.monthWithContributions };

    it('Should start at the whole bill and say what the contributions cover', async () => {
      await renderPage('electricity', openMonth);

      // O vencimento é a cópia do pagamento sem dono (dia 20), não o da conta de hoje (dia 10): o mês não segue a conta.
      expect(screen.getByText('vence dia 20 · faltam R$ 100,00')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('R$ 200,00')).toBeOnTheScreen();
      expect(screen.getByText('A conta inteira, com os R$ 100,00 de Ana.')).toBeOnTheScreen();
    });

    it('Should refuse a payment below the sum of the contributions', async () => {
      const user = await renderPage('electricity', openMonth);

      const field = screen.getByLabelText('Valor pago');
      await user.clear(field);
      await user.type(field, '9000');
      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
      await user.press(screen.getByRole('button', { name: SUBMIT }));

      expect(await screen.findByText('O pagamento não fica abaixo das contribuições, de R$ 100,00.')).toBeOnTheScreen();
      expect(payRecurringBillService).not.toHaveBeenCalled();
    });

    it('Should open the payment with the sum of the contributions from "Anexar o comprovante da conta"', async () => {
      await renderPage('rent', { ...openMonth, attach: '1' });

      expect(screen.queryByText('Esta conta já foi paga neste mês.')).not.toBeOnTheScreen();
      expect(screen.getByDisplayValue('R$ 2.000,00')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: SUBMIT })).toBeOnTheScreen();
    });

    it('Should say the bill was already paid when the contributions reached the expected amount', async () => {
      await renderPage('rent', openMonth);

      expect(screen.getByText('Esta conta já foi paga neste mês.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: SUBMIT })).not.toBeOnTheScreen();
    });
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

  it('Should show the form for the next month, which can be paid before it starts', async () => {
    await renderPage(paymentOfScenario.bill.id, {
      month: '2026-11',
      entriesScenario: entryMonthQueryScenarios.nextMonthPaidEarly,
    });

    expect(screen.getByText('Conta de novembro')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: SUBMIT })).toBeOnTheScreen();
    expect(screen.queryByText('Esta conta não está a pagar neste mês.')).not.toBeOnTheScreen();
  });

  describe.each([
    ['the month after the next', '2026-12'],
    ['a month far in the future', '2027-01'],
    ['a text that is not a month', 'outubro'],
    ['no month', undefined],
    ['a month before the bill starts', '2025-12'],
    ['a month before the first month of the app', '2026-09'],
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

  describe('The amount read from the receipt', () => {
    const fromReceipt = payRecurringBillScenarios.memberPaysWithAmountReadFromReceipt;
    const [paymentFromReceipt] = fromReceipt.input;

    beforeEach(() => {
      jest.mocked(prepareReceipt).mockResolvedValue(paymentFromReceipt.receipt);
    });

    it('Should fill the amount paid with the one read from the receipt and say where it came from', async () => {
      const user = await renderPage();

      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));

      expect(screen.getByDisplayValue('R$ 125,50')).toBeOnTheScreen();
      expect(screen.getByText(RECEIPT_NOTE)).toBeOnTheScreen();
      expect(screen.queryByText(EXPECTED_NOTE)).not.toBeOnTheScreen();
    });

    it('Should register the payment with the amount read from the receipt', async () => {
      mockServiceScenario(payRecurringBillService, fromReceipt);
      const user = await renderPage();

      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
      await user.press(screen.getByRole('button', { name: SUBMIT }));

      expect(payRecurringBillService).toHaveBeenCalledWith(paymentFromReceipt);
    });

    it('Should keep the amount the member typed when a receipt is attached', async () => {
      const user = await renderPage();
      const field = screen.getByLabelText('Valor pago');
      await user.clear(field);
      await user.type(field, '13000');

      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));

      expect(screen.getByDisplayValue('R$ 130,00')).toBeOnTheScreen();
      expect(screen.queryByText(RECEIPT_NOTE)).not.toBeOnTheScreen();
    });

    it('Should drop the receipt note once the member types in the amount', async () => {
      const user = await renderPage();
      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));

      const field = screen.getByLabelText('Valor pago');
      await user.clear(field);
      await user.type(field, '13000');

      expect(screen.getByDisplayValue('R$ 130,00')).toBeOnTheScreen();
      expect(screen.queryByText(RECEIPT_NOTE)).not.toBeOnTheScreen();
      expect(screen.getByText(EXPECTED_NOTE)).toBeOnTheScreen();
    });

    it('Should go back to the expected amount when the new receipt reads nothing', async () => {
      const user = await renderPage();
      await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
      jest.mocked(prepareReceipt).mockResolvedValue(paymentOfScenario.receipt);

      await user.press(screen.getByRole('button', { name: `Comprovante: ${paymentFromReceipt.receipt.name}. Trocar` }));

      expect(screen.getByDisplayValue('R$ 119,90')).toBeOnTheScreen();
      expect(screen.getByText(EXPECTED_NOTE)).toBeOnTheScreen();
    });
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

    it('Should open with the amount read from the shared receipt', async () => {
      const [paymentFromReceipt] = payRecurringBillScenarios.memberPaysWithAmountReadFromReceipt.input;
      useSharedReceiptStore.setState({ receipt: paymentFromReceipt.receipt });

      await renderPage(undefined, sharedOpening);

      expect(screen.getByDisplayValue('R$ 125,50')).toBeOnTheScreen();
      expect(screen.getByText(RECEIPT_NOTE)).toBeOnTheScreen();
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
