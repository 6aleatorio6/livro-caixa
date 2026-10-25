import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { removeRecurringBillService } from '@/shared/services/recurringBill/remove/removeRecurringBillService';
import { removeRecurringBillScenarios } from '@/shared/services/recurringBill/remove/removeRecurringBillService.scenarios';
import { updateRecurringBillService } from '@/shared/services/recurringBill/update/updateRecurringBillService';
import { updateRecurringBillScenarios } from '@/shared/services/recurringBill/update/updateRecurringBillService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';

import { EditRecurringBillPage } from './EditRecurringBillPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('@/shared/services/recurringBill/update/updateRecurringBillService', () => ({
  updateRecurringBillService: jest.fn(),
}));
jest.mock('@/shared/services/recurringBill/remove/removeRecurringBillService', () => ({
  removeRecurringBillService: jest.fn(),
}));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };

describe('EditRecurringBillPage', () => {
  async function renderPage(id: string, ...mocks: Parameters<typeof mockRealtime>) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id });
    const realtime = mockRealtime(...(mocks.length > 0 ? mocks : [fiveBills, threeTags]));
    await render(<EditRecurringBillPage />);
    return { user: userEvent.setup(), realtime };
  }

  async function retypeAmount(user: Awaited<ReturnType<typeof renderPage>>['user'], digits: string) {
    await user.clear(screen.getByLabelText('Valor previsto'));
    await user.type(screen.getByLabelText('Valor previsto'), digits);
  }

  describe('Saving', () => {
    it('Should start with the bill: name, amount, day, date and the chosen tag', async () => {
      await renderPage('internet');

      expect(screen.getByLabelText('Nome da conta')).toHaveDisplayValue('Internet');
      expect(screen.getByLabelText('Valor previsto')).toHaveDisplayValue('R$ 119,90');
      expect(screen.getByLabelText('Dia do mês')).toHaveDisplayValue('15');
      expect(screen.getByDisplayValue('01/01/2026')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Serviços' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Casa' })).not.toBeSelected();
    });

    it('Should warn that the change reaches only the months without payment', async () => {
      await renderPage('internet');

      expect(
        screen.getByText('A mudança vale para os meses ainda sem pagamento. Os meses já pagos não mudam.'),
      ).toBeOnTheScreen();
    });

    it('Should change the amount with the scenario input, say so and go back', async () => {
      const scenario = updateRecurringBillScenarios.memberChangesAmount;
      mockServiceScenario(updateRecurringBillService, scenario);
      const { user } = await renderPage('internet');

      await retypeAmount(user, '12990');
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateRecurringBillService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Conta salva', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should clear the tag with the scenario input when the chosen chip is pressed', async () => {
      const scenario = updateRecurringBillScenarios.memberRemovesTag;
      mockServiceScenario(updateRecurringBillService, scenario);
      const { user } = await renderPage('internet');

      await user.press(screen.getByRole('button', { name: 'Serviços' }));
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateRecurringBillService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should show the amount before the change while the field differs from it', async () => {
      const { user } = await renderPage('internet');
      expect(screen.queryByText(/^Era /)).not.toBeOnTheScreen();

      await retypeAmount(user, '12990');
      expect(screen.getByText('Era R$ 119,90.')).toBeOnTheScreen();

      await retypeAmount(user, '11990');
      expect(screen.queryByText(/^Era /)).not.toBeOnTheScreen();
    });

    it('Should not repeat the support texts of the new bill', async () => {
      await renderPage('internet');

      expect(screen.queryByText('Quem paga confirma ou corrige este valor no pagamento.')).not.toBeOnTheScreen();
      expect(screen.queryByText('Antes desta data, a conta não aparece no Início.')).not.toBeOnTheScreen();
    });

    it('Should start without a chosen chip for a bill without tag', async () => {
      await renderPage(
        'gas',
        { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billWithoutTag },
        threeTags,
      );

      expect(screen.getByLabelText('Nome da conta')).toHaveDisplayValue('Gás');
      for (const name of ['Casa', 'Saúde', 'Serviços']) {
        expect(screen.getByRole('button', { name })).not.toBeSelected();
      }
    });

    it('Should start without the tag of a bill whose tag was deleted, and save it without tag', async () => {
      const scenario = updateRecurringBillScenarios.memberRemovesTag;
      mockServiceScenario(updateRecurringBillService, scenario);
      const { user } = await renderPage(
        'internet',
        { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billWithDeletedTag },
        threeTags,
      );

      for (const name of ['Casa', 'Saúde', 'Serviços']) {
        expect(screen.getByRole('button', { name })).not.toBeSelected();
      }
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateRecurringBillService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should say the tags could not be loaded when the read fails', async () => {
      await renderPage('internet', fiveBills, { service: tagListQueryService, status: 'error' });

      expect(screen.getByText('Não deu para carregar as tags.')).toBeOnTheScreen();
    });

    it('Should keep the tag of the bill when the tags could not be read', async () => {
      const scenario = updateRecurringBillScenarios.memberChangesAmount;
      mockServiceScenario(updateRecurringBillService, scenario);
      const { user } = await renderPage('internet', fiveBills, { service: tagListQueryService, status: 'error' });

      await retypeAmount(user, '12990');
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateRecurringBillService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should refuse an emptied amount and stay on the screen', async () => {
      const { user } = await renderPage('internet');

      await user.clear(screen.getByLabelText('Valor previsto'));
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
      expect(updateRecurringBillService).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should call the service once when the button is pressed twice while saving', async () => {
      let resolveSave!: () => void;
      jest.mocked(updateRecurringBillService).mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
      );
      const { user } = await renderPage('internet');

      await retypeAmount(user, '12990');
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateRecurringBillService).toHaveBeenCalledTimes(1);
      await act(async () => resolveSave());
    });
  });

  describe('Deleting', () => {
    it('Should ask for confirmation, then delete the bill, say so and go back', async () => {
      const scenario = removeRecurringBillScenarios.memberRemovesBill;
      mockServiceScenario(removeRecurringBillService, scenario);
      const { user } = await renderPage('internet');

      await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
      expect(screen.getByText('Excluir a conta Internet?')).toBeOnTheScreen();
      expect(removeRecurringBillService).not.toHaveBeenCalled();
      await user.press(screen.getByRole('button', { name: 'Excluir' }));

      expect(removeRecurringBillService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Conta excluída', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should keep the bill when the confirmation is cancelled', async () => {
      const { user } = await renderPage('internet');

      await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
      await user.press(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByText('Excluir a conta Internet?')).not.toBeOnTheScreen();
      expect(removeRecurringBillService).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });
  });

  describe('When the bill is not in the list', () => {
    it('Should say the bill was deleted when another person deletes it with the screen open', async () => {
      const { realtime } = await renderPage(
        'internet',
        { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billDeletedWhileOpen },
        threeTags,
      );
      expect(screen.getByLabelText('Nome da conta')).toBeOnTheScreen();

      await act(async () => realtime.applyChange(recurringBillListQueryService));

      expect(screen.getByText('Esta conta foi excluída.')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Nome da conta')).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Salvar alterações' })).not.toBeOnTheScreen();
    });

    it('Should wait for the tags before showing the form', async () => {
      await renderPage('internet', fiveBills, { service: tagListQueryService, status: 'loading' });

      expect(screen.queryByLabelText('Nome da conta')).not.toBeOnTheScreen();
    });

    it('Should say the bill was deleted when the id is not in the list', async () => {
      await renderPage('inexistente');

      expect(screen.getByText('Esta conta foi excluída.')).toBeOnTheScreen();
    });

    it('Should show nothing while the bills are loading', async () => {
      await renderPage('internet', { service: recurringBillListQueryService, status: 'loading' }, threeTags);

      expect(screen.queryByText('Esta conta foi excluída.')).not.toBeOnTheScreen();
      expect(screen.queryByLabelText('Nome da conta')).not.toBeOnTheScreen();
    });

    it('Should say the bill could not be loaded when the read fails', async () => {
      await renderPage('internet', { service: recurringBillListQueryService, status: 'error' }, threeTags);

      expect(screen.getByText('Não deu para carregar a conta.')).toBeOnTheScreen();
    });
  });
});
