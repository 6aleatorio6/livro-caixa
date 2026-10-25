import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { addRecurringBillService } from '@/shared/services/recurringBill/add/addRecurringBillService';
import { addRecurringBillScenarios } from '@/shared/services/recurringBill/add/addRecurringBillService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { NewRecurringBillPage } from './NewRecurringBillPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/recurringBill/add/addRecurringBillService', () => ({ addRecurringBillService: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('@react-native-community/datetimepicker', () => ({ DateTimePickerAndroid: { open: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

type IUser = ReturnType<typeof userEvent.setup>;
type IOpenArgs = { onValueChange: (event: unknown, date: Date) => void };

describe('NewRecurringBillPage', () => {
  async function renderPage() {
    mockRealtime({ service: tagListQueryService, scenario: tagListQueryScenarios.threeTags });
    await render(<NewRecurringBillPage />);
    return userEvent.setup();
  }

  async function typeInto(user: IUser, label: string, text: string) {
    await user.type(screen.getByLabelText(label), text);
  }

  /** Escolhe a data pelo calendário do Android, mockado como no teste do `DateField`. */
  async function pickDate(user: IUser, date: Date) {
    await user.press(screen.getByRole('button', { name: 'Vale a partir de' }));
    const { onValueChange } = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0] as unknown as IOpenArgs;
    await act(async () => onValueChange({}, date));
  }

  /** Preenche como o `Q00c2`: Gás, R$ 120,00, dia 25 e a data 01/11/2026 (a tag fica para cada teste). */
  async function fillGas(user: IUser, overrides: { name?: string; day?: string } = {}) {
    await typeInto(user, 'Nome da conta', overrides.name ?? 'Gás');
    await typeInto(user, 'Valor previsto', '12000');
    await typeInto(user, 'Dia do mês', overrides.day ?? '25');
    await pickDate(user, new Date(2026, 10, 1));
  }

  it('Should offer the tags of the list as chips, none of them chosen', async () => {
    await renderPage();

    for (const name of ['Casa', 'Saúde', 'Serviços']) {
      expect(screen.getByRole('button', { name })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name })).not.toBeSelected();
    }
  });

  it('Should say the tags could not be loaded when the read fails', async () => {
    mockRealtime({ service: tagListQueryService, status: 'error' });
    await render(<NewRecurringBillPage />);

    expect(screen.getByText('Não deu para carregar as tags.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Casa' })).not.toBeOnTheScreen();
  });

  it('Should not say the tags could not be loaded when they were', async () => {
    await renderPage();

    expect(screen.queryByText('Não deu para carregar as tags.')).not.toBeOnTheScreen();
  });

  it('Should register the bill with the input of the scenario, say so and go back', async () => {
    const scenario = addRecurringBillScenarios.memberAddsBill;
    mockServiceScenario(addRecurringBillService, scenario);
    const user = await renderPage();

    await fillGas(user);
    await user.press(screen.getByRole('button', { name: 'Casa' }));
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(addRecurringBillService).toHaveBeenCalledWith(...scenario.input);
    expect(showToast).toHaveBeenCalledWith('Conta cadastrada', 'success');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('Should register a bill without tag when no chip is chosen', async () => {
    const scenario = addRecurringBillScenarios.memberAddsBillWithNullTag;
    mockServiceScenario(addRecurringBillService, scenario);
    const user = await renderPage();

    await fillGas(user);
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(addRecurringBillService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should clear the tag when the chosen chip is pressed again', async () => {
    const scenario = addRecurringBillScenarios.memberAddsBillWithNullTag;
    mockServiceScenario(addRecurringBillService, scenario);
    const user = await renderPage();

    await fillGas(user);
    await user.press(screen.getByRole('button', { name: 'Casa' }));
    expect(screen.getByRole('button', { name: 'Casa' })).toBeSelected();
    await user.press(screen.getByRole('button', { name: 'Casa' }));
    expect(screen.getByRole('button', { name: 'Casa' })).not.toBeSelected();
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(addRecurringBillService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should keep only the chip chosen last', async () => {
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: 'Casa' }));
    await user.press(screen.getByRole('button', { name: 'Serviços' }));

    expect(screen.getByRole('button', { name: 'Serviços' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Casa' })).not.toBeSelected();
  });

  it('Should show the date chosen in the calendar as the person reads it', async () => {
    const user = await renderPage();

    await pickDate(user, new Date(2026, 10, 1));

    expect(screen.getByDisplayValue('01/11/2026')).toBeOnTheScreen();
  });

  it('Should show the money typed as reais, entering the digits from the right', async () => {
    const user = await renderPage();

    await typeInto(user, 'Valor previsto', '12000');

    expect(screen.getByDisplayValue('R$ 120,00')).toBeOnTheScreen();
  });

  it('Should refuse the empty fields and stay on the screen', async () => {
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(await screen.findAllByText('Preencha este campo.')).toHaveLength(3);
    expect(addRecurringBillService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should refuse a zero amount', async () => {
    const user = await renderPage();

    await typeInto(user, 'Valor previsto', '0');
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(await screen.findByText('Digite um valor maior que zero.')).toBeOnTheScreen();
    expect(addRecurringBillService).not.toHaveBeenCalled();
  });

  it.each(['0', '32', '100', '1.5', 'ab'])('Should refuse the day %s', async (day) => {
    const user = await renderPage();

    await fillGas(user, { day });
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(await screen.findByText('Digite um dia de 1 a 31.')).toBeOnTheScreen();
    expect(addRecurringBillService).not.toHaveBeenCalled();
  });

  it.each(['1', '31'])('Should accept the day %s as a number', async (day) => {
    mockServiceScenario(addRecurringBillService, addRecurringBillScenarios.memberAddsBillWithNullTag);
    const user = await renderPage();

    await fillGas(user, { day });
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(addRecurringBillService).toHaveBeenCalledWith(expect.objectContaining({ dayOfMonth: Number(day) }));
  });

  it('Should register a bill named with 60 characters and trim the name', async () => {
    mockServiceScenario(addRecurringBillService, addRecurringBillScenarios.memberAddsBillWithNullTag);
    const user = await renderPage();

    await fillGas(user, { name: ` ${'a'.repeat(60)} ` });
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(addRecurringBillService).toHaveBeenCalledWith(expect.objectContaining({ name: 'a'.repeat(60) }));
  });

  it('Should refuse a name of 61 characters and stay on the screen', async () => {
    const user = await renderPage();

    await fillGas(user, { name: 'a'.repeat(61) });
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(await screen.findByText('Use no máximo 60 caracteres.')).toBeOnTheScreen();
    expect(addRecurringBillService).not.toHaveBeenCalled();
  });

  it('Should call the service once when the button is pressed twice while saving', async () => {
    let resolveSave!: () => void;
    jest.mocked(addRecurringBillService).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );
    const user = await renderPage();

    await fillGas(user);
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));
    await user.press(screen.getByRole('button', { name: 'Cadastrar conta' }));

    expect(addRecurringBillService).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave());
  });

  it('Should show the chips of the tags read, and none while they load', async () => {
    mockRealtime({ service: tagListQueryService, status: 'loading' });
    await render(<NewRecurringBillPage />);

    expect(screen.queryByRole('button', { name: 'Casa' })).not.toBeOnTheScreen();
    expect(useRealtime).toHaveBeenCalledWith(tagListQueryService, tagListQueryScenarios.threeTags.input);
  });
});
