import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { AppError } from '@/shared/exceptions/AppError';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { addOneOffBillService } from '@/shared/services/entry/add/addOneOffBillService';
import { addOneOffBillRejectedScenarios, addOneOffBillScenarios } from '@/shared/services/entry/add/addOneOffBillService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';

import { NewOneOffBillPage } from './NewOneOffBillPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/entry/add/addOneOffBillService', () => ({ addOneOffBillService: jest.fn() }));
jest.mock('@/shared/utils/file/pickReceiptFile', () => ({ pickReceiptFile: jest.fn() }));
jest.mock('@/shared/utils/file/prepareReceipt', () => ({ prepareReceipt: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@react-native-community/datetimepicker', () => ({ DateTimePickerAndroid: { open: jest.fn() } }));

type IUser = ReturnType<typeof userEvent.setup>;
type IOpenArgs = { value: Date; maximumDate?: Date; onValueChange: (event: unknown, date: Date) => void };

const scenario = addOneOffBillScenarios.memberAddsOneOffBill;
const [bill] = scenario.input;
const pickedFile = { uri: 'file:///x', name: 'x.png', contentType: 'image/png', sizeBytes: 10 };
const RECEIPT_BUTTON = 'Comprovante: Nenhum arquivo anexado. Escolher';
const SUBMIT = 'Registrar conta avulsa';

beforeEach(() => {
  jest.clearAllMocks();
  // "Hoje" fixo, de outubro de 2026; o relógio segue andando para as animações dos campos não travarem.
  jest.useFakeTimers({
    now: new Date(2026, 9, 25),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
  jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
  jest.mocked(prepareReceipt).mockResolvedValue(bill.receipt);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('NewOneOffBillPage', () => {
  async function renderPage() {
    mockRealtime(
      { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags },
      { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList },
    );
    await render(<NewOneOffBillPage />);
    return userEvent.setup();
  }

  async function openCalendar(user: IUser) {
    await user.press(screen.getByRole('button', { name: 'Data' }));
    return jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0] as unknown as IOpenArgs;
  }

  /** Escolhe a data pelo calendário do Android, mockado como no teste do `DateField`. */
  async function pickDate(user: IUser, date: Date) {
    const { onValueChange } = await openCalendar(user);
    await act(async () => onValueChange({}, date));
  }

  /** Preenche a Farmácia do cenário: R$ 89,90 na `date` dada, com o comprovante (a tag fica para cada teste). */
  async function fillPharmacy(user: IUser, date = new Date(2026, 9, 12)) {
    await user.type(screen.getByLabelText('Nome da conta'), ` ${bill.name} `);
    await user.type(screen.getByLabelText('Valor pago'), String(bill.amountCents));
    await pickDate(user, date);
    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
  }

  it('Should show today in the date field and let the calendar go up to today', async () => {
    const user = await renderPage();

    expect(screen.getByDisplayValue('25/10/2026')).toBeOnTheScreen();
    const { maximumDate } = await openCalendar(user);
    expect(maximumDate).toEqual(new Date(2026, 9, 25));
  });

  it('Should register the bill with the input of the scenario, say so and go back', async () => {
    mockServiceScenario(addOneOffBillService, scenario);
    const user = await renderPage();

    await fillPharmacy(user);
    await user.press(screen.getByRole('button', { name: 'Casa' }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(addOneOffBillService).toHaveBeenCalledWith(...scenario.input);
    expect(showToast).toHaveBeenCalledWith('Conta avulsa registrada.', 'success');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('Should register a bill without tag when no chip is chosen', async () => {
    const withoutTag = addOneOffBillScenarios.memberAddsOneOffBillWithoutTag;
    mockServiceScenario(addOneOffBillService, withoutTag);
    const user = await renderPage();

    await fillPharmacy(user);
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(addOneOffBillService).toHaveBeenCalledWith(...withoutTag.input);
  });

  it('Should send the date chosen in the calendar, even from the previous month', async () => {
    const september = addOneOffBillScenarios.memberAddsSeptemberBill;
    mockServiceScenario(addOneOffBillService, september);
    const user = await renderPage();

    await fillPharmacy(user, new Date(2026, 8, 30));
    await user.press(screen.getByRole('button', { name: 'Casa' }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(screen.getByDisplayValue('30/09/2026')).toBeOnTheScreen();
    expect(addOneOffBillService).toHaveBeenCalledWith(...september.input);
  });

  it('Should refuse a bill without receipt, say so and not call the service', async () => {
    const user = await renderPage();

    await user.type(screen.getByLabelText('Nome da conta'), bill.name);
    await user.type(screen.getByLabelText('Valor pago'), String(bill.amountCents));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByText('Anexe o comprovante.')).toBeOnTheScreen();
    expect(addOneOffBillService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should not send the previous receipt when the next file chosen is rejected', async () => {
    const user = await renderPage();
    await fillPharmacy(user);
    jest.mocked(pickReceiptFile).mockResolvedValue({ ...pickedFile, name: 'grande.png', sizeBytes: 6 * 1024 * 1024 });
    jest.mocked(prepareReceipt).mockRejectedValue(new AppError('Receipt is over 5 MB', 'A imagem passa de 5 MB. Escolha outro arquivo.'));

    await user.press(screen.getByRole('button', { name: `Comprovante: ${bill.receipt.name}. Trocar` }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByText('A imagem passa de 5 MB. Escolha outro arquivo.')).toBeOnTheScreen();
    expect(screen.getByText('grande.png')).toBeOnTheScreen();
    expect(addOneOffBillService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should refuse the empty name and amount', async () => {
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findAllByText('Preencha este campo.')).toHaveLength(2);
    expect(addOneOffBillService).not.toHaveBeenCalled();
  });

  it('Should offer the tags of the list as chips, none of them chosen', async () => {
    await renderPage();

    for (const name of ['Casa', 'Saúde', 'Serviços']) {
      expect(screen.getByRole('button', { name })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name })).not.toBeSelected();
    }
  });

  it('Should say the bill stays in the name of the person and not ask who paid', async () => {
    await renderPage();

    expect(
      screen.getByText('Fica no seu nome, Bruno. Só você poderá alterar ou excluir esta conta.'),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Quem pagou')).not.toBeOnTheScreen();
    expect(screen.queryByText('Quem pagou')).not.toBeOnTheScreen();
  });

  it('Should call the service once when the button is pressed twice while saving', async () => {
    let resolveSave!: () => void;
    jest.mocked(addOneOffBillService).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = await renderPage();

    await fillPharmacy(user);
    await user.press(screen.getByRole('button', { name: SUBMIT }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(addOneOffBillService).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave());
  });

  it('Should stay on the screen with the data when the service fails', async () => {
    const rejected = addOneOffBillRejectedScenarios.receiptRejectedByStorage;
    const [rejectedBill] = rejected.input;
    mockServiceRejection(addOneOffBillService, rejected);
    jest.mocked(prepareReceipt).mockResolvedValue(rejectedBill.receipt);
    const user = await renderPage();

    await fillPharmacy(user);
    await user.press(screen.getByRole('button', { name: 'Casa' }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(addOneOffBillService).toHaveBeenCalledWith(...rejected.input);
    expect(showToast).toHaveBeenCalledWith(rejected.result.userMessage, 'error');
    expect(router.back).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('Farmácia')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('R$ 89,90')).toBeOnTheScreen();
    expect(screen.getByText(rejectedBill.receipt.name)).toBeOnTheScreen();
  });
});
