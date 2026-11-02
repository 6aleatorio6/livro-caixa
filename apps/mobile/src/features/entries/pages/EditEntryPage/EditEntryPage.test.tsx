import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { act, render, screen, userEvent, within } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';
import { AppError } from '@/shared/exceptions/AppError';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { deleteEntryService } from '@/shared/services/entry/deleteEntryService';
import { deleteEntryScenarios } from '@/shared/services/entry/deleteEntryService.scenarios';
import { convertEntryService } from '@/shared/services/entry/convertEntryService';
import { convertEntryScenarios } from '@/shared/services/entry/convertEntryService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { entryQueryScenarios } from '@/shared/services/entry/query/entryQueryService.scenarios';
import { updateEntryService } from '@/shared/services/entry/updateEntryService';
import {
  updateEntryRejectedScenarios,
  updateEntryScenarios,
} from '@/shared/services/entry/updateEntryService.scenarios';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { receiptFileQueryScenarios } from '@/shared/services/file/query/receiptFileQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { NEW_RECEIPT } from '@/shared/testing/entryFixtures';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';
import type { IRealtimeMock } from '@/shared/types/testing/RealtimeMock';

import { EditEntryPage } from './EditEntryPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryQueryService', () => ({ entryQueryService: {} }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/entry/convertEntryService', () => ({ convertEntryService: jest.fn() }));
jest.mock('@/shared/services/file/query/receiptFileQueryService', () => ({ receiptFileQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/entry/updateEntryService', () => ({ updateEntryService: jest.fn() }));
jest.mock('@/shared/services/entry/deleteEntryService', () => ({ deleteEntryService: jest.fn() }));
jest.mock('@/shared/utils/file/pickReceiptFile', () => ({ pickReceiptFile: jest.fn() }));
jest.mock('@/shared/utils/file/prepareReceipt', () => ({ prepareReceipt: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('@react-native-community/datetimepicker', () => ({ DateTimePickerAndroid: { open: jest.fn() } }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), dismiss: jest.fn() }, useLocalSearchParams: jest.fn() }));

const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
const paymentToChange = { service: entryQueryService, scenario: entryQueryScenarios.paymentOfTheMember };
const oneOffBillToChange = { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillOfTheMember };
const receiptToChange = { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.receiptToChange };
// O mês do lançamento, sem contribuições: o padrão de toda tela que não diz outro.
const monthWithoutContributions = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };

// O mock do lançamento lido pelo id: o `id` do cenário é o da rota.
type IEntryMock = IRealtimeMock & { scenario: { input: { id: string } } };

const pickedFile = { uri: 'file:///x', name: 'x.png', contentType: 'image/png', sizeBytes: 10 };
const SAVE = 'Salvar alterações';

beforeEach(() => {
  jest.clearAllMocks();
  // O relógio segue andando para as animações dos campos não travarem nem vazarem do teste.
  jest.useFakeTimers({
    now: new Date(2026, 9, 25),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
  jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
  jest.mocked(prepareReceipt).mockResolvedValue(NEW_RECEIPT);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('EditEntryPage', () => {
  async function renderEdit(entry: IEntryMock = paymentToChange, ...others: Parameters<typeof mockRealtime>) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: entry.scenario.input.id });
    // O mês sem contribuições vai depois do que o teste dá, com a mesma entrada, que vem antes e vale; sem o
    // lançamento, a leitura do mês fica parada.
    mockRealtime(entry, ...(others.length ? others : [receiptToChange, family, threeTags]), monthWithoutContributions, {
      service: entryMonthQueryService,
      status: 'idle',
    });
    await render(<EditEntryPage />);
    return userEvent.setup();
  }

  async function confirmDeletion(user: Awaited<ReturnType<typeof renderEdit>>) {
    await user.press(screen.getByRole('button', { name: 'Excluir pagamento' }));
    await user.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Excluir' }));
  }

  describe('The payment', () => {
    it('Should show the bill as read only, the amount paid, the current receipt and who may change it', async () => {
      await renderEdit();
      // Os campos preenchidos animam o rótulo ao montar; sem esperar, a animação vaza do teste.
      await act(async () => jest.advanceTimersByTimeAsync(500));

      expect(screen.getByText('Pagamento de outubro')).toBeOnTheScreen();
      expect(screen.getByText('Luz')).toBeOnTheScreen();
      expect(screen.getByText('Serviços')).toBeOnTheScreen();
      expect(screen.getByText('vence dia 10 · previsto R$ 210,00')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('R$ 187,35')).toBeOnTheScreen();
      expect(screen.getByText('Corrija se pagou outro valor.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' })).toBeOnTheScreen();
      expect(screen.getByText('Registrado por você em 10/10/2026. Só você pode alterar ou excluir.')).toBeOnTheScreen();
    });

    it('Should save the corrected amount keeping the receipt, say so and go back to the sheet', async () => {
      const scenario = updateEntryScenarios.memberChangesPaymentAmount;
      mockServiceScenario(updateEntryService, scenario);
      const user = await renderEdit();

      await user.clear(screen.getByLabelText('Valor pago'));
      await user.type(screen.getByLabelText('Valor pago'), '20000');
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Pagamento alterado.', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should send the new file when the receipt is replaced', async () => {
      const scenario = updateEntryScenarios.memberReplacesPaymentReceipt;
      mockServiceScenario(updateEntryService, scenario);
      const user = await renderEdit();

      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' }));
      expect(screen.getByText(NEW_RECEIPT.name)).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should fill the amount paid with the one read from the new receipt and say where it came from', async () => {
      jest.mocked(prepareReceipt).mockResolvedValue({ ...NEW_RECEIPT, readAmountCents: 19990 });
      const user = await renderEdit();

      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' }));

      expect(screen.getByDisplayValue('R$ 199,90')).toBeOnTheScreen();
      expect(screen.getByText('Veio do comprovante. Corrija se pagou outro valor.')).toBeOnTheScreen();
    });

    it('Should go back to the saved amount when the new receipt is refused', async () => {
      jest.mocked(prepareReceipt).mockResolvedValue({ ...NEW_RECEIPT, readAmountCents: 19990 });
      const user = await renderEdit();
      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' }));
      jest
        .mocked(prepareReceipt)
        .mockRejectedValue(
          new AppError('Receipt is over 900 KiB', 'Mesmo comprimida, a imagem passa de 900 KB. Escolha outro arquivo.'),
        );

      await user.press(screen.getByRole('button', { name: `Comprovante: ${NEW_RECEIPT.name}. Trocar` }));

      expect(screen.getByDisplayValue('R$ 187,35')).toBeOnTheScreen();
      expect(screen.getByText('Corrija se pagou outro valor.')).toBeOnTheScreen();
    });

    it('Should call the service and go back even when nothing was changed', async () => {
      const scenario = updateEntryScenarios.memberSavesPaymentUnchanged;
      mockServiceScenario(updateEntryService, scenario);
      const user = await renderEdit();

      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...scenario.input);
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should refuse an empty amount and not call the service', async () => {
      const user = await renderEdit();

      await user.clear(screen.getByLabelText('Valor pago'));
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
      expect(updateEntryService).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should ask for the receipt of a payment whose record is missing', async () => {
      const user = await renderEdit(
        paymentToChange,
        { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.missingReceiptFile },
        family,
        threeTags,
      );
      expect(screen.getByRole('button', { name: 'Comprovante: Nenhum arquivo anexado. Escolher' })).toBeOnTheScreen();

      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(await screen.findByText('Anexe o comprovante.')).toBeOnTheScreen();
      expect(updateEntryService).not.toHaveBeenCalled();
    });

    it('Should stay on the screen and warn when the new file cannot be read', async () => {
      const rejected = updateEntryRejectedScenarios.replacementReceiptUnreadable;
      mockServiceRejection(updateEntryService, rejected);
      jest.mocked(prepareReceipt).mockResolvedValue(rejected.input[0].receipt!);
      const user = await renderEdit();

      await user.clear(screen.getByLabelText('Valor pago'));
      await user.type(screen.getByLabelText('Valor pago'), '20000');
      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' }));
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...rejected.input);
      expect(showToast).toHaveBeenCalledWith(rejected.result.userMessage, 'error');
      expect(router.back).not.toHaveBeenCalled();
    });
  });

  describe('The one-off bill', () => {
    async function renderOneOffBill() {
      return renderEdit(oneOffBillToChange, receiptToChange, family, threeTags);
    }

    async function pickDate(user: Awaited<ReturnType<typeof renderEdit>>, date: Date) {
      await user.press(screen.getByRole('button', { name: 'Data' }));
      const { onValueChange } = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0] as unknown as {
        onValueChange: (event: unknown, date: Date) => void;
      };
      await act(async () => onValueChange({}, date));
    }

    it('Should open the form filled with the bill, the date hint, the chosen tag and the current receipt, and no ownership notice', async () => {
      await renderOneOffBill();
      await act(async () => jest.advanceTimersByTimeAsync(500));

      expect(screen.getByText('Alterar conta avulsa')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('Conserto da geladeira')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('R$ 350,00')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('12/10/2026')).toBeOnTheScreen();
      expect(screen.getByText('A data define o mês em que a conta entra.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Casa' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' })).toBeOnTheScreen();
      expect(screen.queryByText(/Fica no seu nome/)).not.toBeOnTheScreen();
      expect(screen.queryByText(/Registrado por você/)).not.toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Excluir conta avulsa' })).toBeOnTheScreen();
    });

    it('Should save the new name, amount, date and no tag keeping the receipt, say so and go back to the sheet', async () => {
      const scenario = updateEntryScenarios.memberChangesOneOffBill;
      mockServiceScenario(updateEntryService, scenario);
      const user = await renderOneOffBill();

      await user.clear(screen.getByLabelText('Nome da conta'));
      await user.type(screen.getByLabelText('Nome da conta'), ` ${scenario.input[0].changes.name} `);
      await user.clear(screen.getByLabelText('Valor pago'));
      await user.type(screen.getByLabelText('Valor pago'), '40000');
      await pickDate(user, new Date(2026, 8, 28));
      await user.press(screen.getByRole('button', { name: 'Casa' }));
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Conta avulsa alterada.', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should send the new file when the receipt is replaced', async () => {
      const scenario = updateEntryScenarios.memberReplacesOneOffBillReceipt;
      mockServiceScenario(updateEntryService, scenario);
      const user = await renderOneOffBill();

      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-antigo.png. Trocar' }));
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should refuse an empty name and not call the service', async () => {
      const user = await renderOneOffBill();

      await user.clear(screen.getByLabelText('Nome da conta'));
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
      expect(updateEntryService).not.toHaveBeenCalled();
    });

    it('Should keep the screen and warn when the change is refused', async () => {
      const refusal = updateEntryRejectedScenarios.memberChangesEntryDeletedMeanwhile;
      mockServiceRejection(updateEntryService, refusal);
      const user = await renderOneOffBill();

      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(updateEntryService).toHaveBeenCalledWith(...refusal.input);
      expect(showToast).toHaveBeenCalledWith(refusal.result.userMessage, 'error');
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should ask first, with the one-off texts, and leave the edit screen and the sheet once the bill is deleted', async () => {
      const scenario = deleteEntryScenarios.memberDeletesOneOffBill;
      mockServiceScenario(deleteEntryService, scenario);
      const user = await renderOneOffBill();

      await user.press(screen.getByRole('button', { name: 'Excluir conta avulsa' }));
      expect(screen.getByText('Excluir a conta avulsa Conserto da geladeira?')).toBeOnTheScreen();
      expect(screen.getByText('A conta avulsa sai do mês, e o comprovante é apagado.')).toBeOnTheScreen();
      expect(deleteEntryService).not.toHaveBeenCalled();
      await user.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Excluir' }));

      expect(deleteEntryService).toHaveBeenCalledWith(...scenario.input);
      expect(router.dismiss).toHaveBeenCalledWith(2);
      expect(showToast).toHaveBeenCalledWith('Conta avulsa excluída.', 'success');
    });
  });

  describe('Paguei só uma parte', () => {
    const SWITCH = { name: 'Paguei só uma parte' };
    const contributionReceipt = {
      service: receiptFileQueryService,
      scenario: receiptFileQueryScenarios.contributionReceipt,
    };

    it('Should turn a payment into a contribution from the switch, say so and leave the edit screen and the sheet', async () => {
      const conversion = convertEntryScenarios.memberTurnsPaymentIntoContribution;
      mockServiceScenario(convertEntryService, conversion);
      const user = await renderEdit();
      await act(async () => jest.advanceTimersByTimeAsync(500));

      expect(screen.getByText('Transforma este pagamento numa contribuição.')).toBeOnTheScreen();
      await user.press(screen.getByRole('switch', SWITCH));
      await user.press(screen.getByRole('button', { name: SAVE }));

      expect(convertEntryService).toHaveBeenCalledWith(...conversion.input);
      expect(updateEntryService).not.toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith('O pagamento virou uma contribuição.', 'success');
      expect(router.dismiss).toHaveBeenCalledWith(2);
    });

    it('Should hide the switch on a contribution to an owned payment', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
      await renderEdit(
        { service: entryQueryService, scenario: entryQueryScenarios.contribution },
        contributionReceipt,
        family,
        threeTags,
        { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithContributionToPayment },
      );
      await act(async () => jest.advanceTimersByTimeAsync(500));

      expect(screen.getByText('Alterar contribuição')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('R$ 40,00')).toBeOnTheScreen();
      expect(screen.queryByRole('switch', SWITCH)).not.toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Excluir contribuição' })).toBeOnTheScreen();
    });

    it('Should still let the author delete a contribution whose entry is no longer in the month', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
      // O mês vazio: a Luz que a contribuição recebia saiu dele.
      await renderEdit(
        { service: entryQueryService, scenario: entryQueryScenarios.contribution },
        contributionReceipt,
        family,
        threeTags,
      );

      expect(screen.getByText('O lançamento desta contribuição não está mais neste mês.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Excluir contribuição' })).toBeEnabled();
      expect(screen.queryByRole('button', { name: SAVE })).not.toBeOnTheScreen();
    });

    describe('A contribution to a month with no owner', () => {
      async function renderMonthContribution() {
        jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
        const user = await renderEdit(
          { service: entryQueryService, scenario: entryQueryScenarios.contributionToUnownedPayment },
          contributionReceipt,
          family,
          threeTags,
          { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithContributionToUnownedPayment },
        );
        await act(async () => jest.advanceTimersByTimeAsync(500));
        return user;
      }

      it('Should turn the contribution into the payment of the month when the switch is turned off', async () => {
        const conversion = convertEntryScenarios.memberTurnsContributionIntoPayment;
        mockServiceScenario(convertEntryService, conversion);
        const user = await renderMonthContribution();

        expect(screen.getByRole('switch', SWITCH)).toBeChecked();
        await user.press(screen.getByRole('switch', SWITCH));
        await user.press(screen.getByRole('button', { name: SAVE }));

        expect(convertEntryService).toHaveBeenCalledWith(...conversion.input);
        expect(showToast).toHaveBeenCalledWith('A contribuição virou o pagamento do mês.', 'success');
      });

      it('Should refuse turning a contribution below 30% of the expected amount into a payment', async () => {
        const change = updateEntryScenarios.memberChangesMonthContributionAmount;
        mockServiceScenario(updateEntryService, change);
        const user = await renderMonthContribution();

        // A Internet prevista em R$ 120,00: 30% são R$ 36,00, e R$ 30,00 fica abaixo.
        const field = screen.getByLabelText('Quanto você pagou');
        await user.clear(field);
        await user.type(field, '3000');
        await user.press(screen.getByRole('switch', SWITCH));

        expect(screen.getByRole('switch', SWITCH)).toBeChecked();
        expect(screen.getByRole('switch', SWITCH)).toBeDisabled();
        await user.press(screen.getByRole('button', { name: SAVE }));

        expect(updateEntryService).toHaveBeenCalledWith(...change.input);
        expect(convertEntryService).not.toHaveBeenCalled();
      });
    });
  });

  describe('Deleting from the edit screen', () => {
    it('Should ask first and call the service only after the dialog is confirmed', async () => {
      const scenario = deleteEntryScenarios.memberDeletesPayment;
      mockServiceScenario(deleteEntryService, scenario);
      const user = await renderEdit();

      await user.press(screen.getByRole('button', { name: 'Excluir pagamento' }));

      expect(screen.getByText('Excluir o pagamento da Luz?')).toBeOnTheScreen();
      expect(deleteEntryService).not.toHaveBeenCalled();
      await user.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Excluir' }));

      expect(deleteEntryService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should leave the edit screen and the sheet once the payment is deleted', async () => {
      mockServiceScenario(deleteEntryService, deleteEntryScenarios.memberDeletesPayment);
      const user = await renderEdit();

      await confirmDeletion(user);

      expect(router.dismiss).toHaveBeenCalledWith(2);
      expect(router.back).not.toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith('Pagamento excluído.', 'success');
    });

    it('Should not delete when the dialog is cancelled', async () => {
      const user = await renderEdit();

      await user.press(screen.getByRole('button', { name: 'Excluir pagamento' }));
      await user.press(screen.getByRole('button', { name: 'Cancelar' }));

      expect(deleteEntryService).not.toHaveBeenCalled();
      expect(router.dismiss).not.toHaveBeenCalled();
    });
  });

  describe('Who may change it', () => {
    it('Should show no field, only who can change it, to a member who did not register the payment', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));

      await renderEdit();

      expect(screen.getByText('Só Bruno pode alterar ou excluir este pagamento.')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Valor pago')).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: SAVE })).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Excluir pagamento' })).not.toBeOnTheScreen();
    });

    it('Should show no field, only who can change it, to a member who did not register the one-off bill', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));

      await renderEdit(oneOffBillToChange, receiptToChange, family, threeTags);

      expect(screen.getByText('Só Bruno pode alterar ou excluir esta conta.')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Nome da conta')).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Excluir conta avulsa' })).not.toBeOnTheScreen();
    });

    it('Should say the entry was deleted for an id that does not exist', async () => {
      await renderEdit(
        { service: entryQueryService, scenario: entryQueryScenarios.missingEntry },
        { service: receiptFileQueryService, status: 'idle' },
        family,
        threeTags,
      );

      expect(screen.getByText('Este lançamento foi excluído.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: SAVE })).not.toBeOnTheScreen();
    });
  });

  describe('The entry or its receipt fails to load', () => {
    it('Should say the entry could not be loaded when the read of the receipt record fails', async () => {
      await renderEdit(oneOffBillToChange, { service: receiptFileQueryService, status: 'error' }, family, threeTags);

      expect(screen.getByText('Não deu para carregar o lançamento.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: SAVE })).not.toBeOnTheScreen();
    });

    it('Should name the kind in the title only once the entry is known', async () => {
      jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'fridge' });
      mockRealtime(
        { service: entryQueryService, status: 'loading' },
        { service: receiptFileQueryService, status: 'idle' },
        { service: entryMonthQueryService, status: 'idle' },
        family,
        threeTags,
      );
      await render(<EditEntryPage />);

      expect(screen.queryByRole('header', { name: 'Alterar pagamento' })).not.toBeOnTheScreen();
      expect(screen.queryByRole('header', { name: 'Alterar conta avulsa' })).not.toBeOnTheScreen();
    });

    it('Should title the screen by the kind of the entry', async () => {
      await renderEdit(oneOffBillToChange, receiptToChange, family, threeTags);

      expect(screen.getByRole('header', { name: 'Alterar conta avulsa' })).toBeOnTheScreen();
    });

    it('Should title the screen of a payment', async () => {
      await renderEdit();

      expect(screen.getByRole('header', { name: 'Alterar pagamento' })).toBeOnTheScreen();
    });
  });
});
