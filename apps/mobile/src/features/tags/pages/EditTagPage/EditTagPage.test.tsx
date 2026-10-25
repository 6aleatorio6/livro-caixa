import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { removeTagService } from '@/shared/services/tag/remove/removeTagService';
import { removeTagScenarios } from '@/shared/services/tag/remove/removeTagService.scenarios';
import { updateTagService } from '@/shared/services/tag/update/updateTagService';
import { updateTagRejectedScenarios, updateTagScenarios } from '@/shared/services/tag/update/updateTagService.scenarios';
import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { HEALTH_TAG_ID } from '@/shared/testing/tagFixtures';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import type { ITag } from '@/shared/types/tag/Tag';

import { EditTagPage } from './EditTagPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('@/shared/services/tag/update/updateTagService', () => ({ updateTagService: jest.fn() }));
jest.mock('@/shared/services/tag/remove/removeTagService', () => ({ removeTagService: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
});

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };

describe('EditTagPage', () => {
  async function renderPage(id: string, ...mocks: Parameters<typeof mockRealtime>) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id });
    const realtime = mockRealtime(...(mocks.length > 0 ? mocks : [threeTags, fiveBills]));
    await render(<EditTagPage />);
    return { user: userEvent.setup(), realtime };
  }

  async function typeName(user: Awaited<ReturnType<typeof renderPage>>['user'], name: string) {
    await user.clear(screen.getByLabelText('Nome da tag'));
    await user.type(screen.getByLabelText('Nome da tag'), name);
  }

  describe('Saving', () => {
    it('Should start with the name and the color of the tag', async () => {
      await renderPage(HEALTH_TAG_ID);

      expect(screen.getByLabelText('Nome da tag')).toHaveDisplayValue('Saúde');
      expect(screen.getByRole('radio', { name: 'Ameixa' })).toBeChecked();
    });

    it('Should rename the tag with the scenario input, say so and go back', async () => {
      const scenario = updateTagScenarios.memberRenamesTag;
      mockServiceScenario(updateTagService, scenario);
      const { user } = await renderPage(HEALTH_TAG_ID);

      await typeName(user, scenario.input[0].name);
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateTagService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Tag salva', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should change only the color with the scenario input', async () => {
      const scenario = updateTagScenarios.memberChangesColor;
      mockServiceScenario(updateTagService, scenario);
      const { user } = await renderPage(UTILITIES_TAG_ID);

      await user.press(screen.getByRole('radio', { name: 'Anil' }));
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateTagService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should accept the own name in another case, since the tag does not repeat itself', async () => {
      const scenario = updateTagScenarios.memberRenamesOwnTagToOtherCase;
      mockServiceScenario(updateTagService, scenario);
      const { user } = await renderPage(HOME_TAG_ID);

      await typeName(user, scenario.input[0].name);
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateTagService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should refuse the name of another tag, naming the tag as it is stored', async () => {
      const rejected = updateTagRejectedScenarios.nameOfAnotherTag;
      const { user } = await renderPage(rejected.input[0].id);

      await typeName(user, rejected.input[0].name);
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText(rejected.result.userMessage)).toBeOnTheScreen();
      expect(updateTagService).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should call the service once when the button is pressed twice while saving', async () => {
      let resolveSave!: () => void;
      jest.mocked(updateTagService).mockReturnValue(
        new Promise<ITag>((resolve) => {
          resolveSave = () => resolve({ ...updateTagScenarios.memberRenamesTag.result });
        }),
      );
      const { user } = await renderPage(HEALTH_TAG_ID);

      await typeName(user, 'Bem-estar');
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));
      await user.press(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(updateTagService).toHaveBeenCalledTimes(1);
      await act(async () => resolveSave());
    });
  });

  describe('Deleting', () => {
    it.each([
      { name: 'Casa', id: HOME_TAG_ID, reason: 'A tag Casa está em 2 contas recorrentes. Para excluir, tire a tag delas.' },
      { name: 'Serviços', id: UTILITIES_TAG_ID, reason: 'A tag Serviços está em 3 contas recorrentes. Para excluir, tire a tag delas.' },
    ])('Should not let $name be deleted while bills use it, and say why', async ({ id, reason }) => {
      const { user } = await renderPage(id);

      expect(screen.getByRole('button', { name: 'Excluir tag' })).toBeDisabled();
      expect(screen.getByText(reason)).toBeOnTheScreen();

      await user.press(screen.getByRole('button', { name: 'Excluir tag' }));

      expect(screen.queryByText(/^Excluir a tag/)).not.toBeOnTheScreen();
      expect(removeTagService).not.toHaveBeenCalled();
    });

    it('Should ask for confirmation, then delete the tag nobody uses, say so and go back', async () => {
      const scenario = removeTagScenarios.memberRemovesTag;
      mockServiceScenario(removeTagService, scenario);
      const { user } = await renderPage(HEALTH_TAG_ID);
      expect(screen.queryByText(/está em/)).not.toBeOnTheScreen();

      await user.press(screen.getByRole('button', { name: 'Excluir tag' }));
      expect(screen.getByText('Excluir a tag Saúde?')).toBeOnTheScreen();
      expect(removeTagService).not.toHaveBeenCalled();
      await user.press(screen.getByRole('button', { name: 'Excluir' }));

      expect(removeTagService).toHaveBeenCalledWith(...scenario.input);
      expect(showToast).toHaveBeenCalledWith('Tag excluída', 'success');
      expect(router.back).toHaveBeenCalledTimes(1);
    });

    it('Should keep the tag when the confirmation is cancelled', async () => {
      const { user } = await renderPage(HEALTH_TAG_ID);

      await user.press(screen.getByRole('button', { name: 'Excluir tag' }));
      await user.press(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByText('Excluir a tag Saúde?')).not.toBeOnTheScreen();
      expect(removeTagService).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should not offer to delete before the recurring bills are read', async () => {
      await renderPage(HEALTH_TAG_ID, threeTags, { service: recurringBillListQueryService, status: 'loading' });

      expect(screen.getByLabelText('Nome da tag')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Excluir tag' })).not.toBeOnTheScreen();
    });
  });

  describe('When the tag is not in the list', () => {
    it('Should say the tag was deleted when another person deletes it with the screen open', async () => {
      const { realtime } = await renderPage(
        HEALTH_TAG_ID,
        { service: tagListQueryService, scenario: tagListQueryScenarios.tagDeletedWhileOpen },
        fiveBills,
      );
      expect(screen.getByLabelText('Nome da tag')).toBeOnTheScreen();

      await act(async () => realtime.applyChange(tagListQueryService));

      expect(screen.getByText('Esta tag foi excluída.')).toBeOnTheScreen();
      expect(screen.queryByLabelText('Nome da tag')).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Salvar alterações' })).not.toBeOnTheScreen();
    });

    it('Should say the tag was deleted when the id is not in the list', async () => {
      await renderPage('inexistente');

      expect(screen.getByText('Esta tag foi excluída.')).toBeOnTheScreen();
    });

    it('Should show nothing while the tags are loading', async () => {
      await renderPage(HEALTH_TAG_ID, { service: tagListQueryService, status: 'loading' }, fiveBills);

      expect(screen.queryByText('Esta tag foi excluída.')).not.toBeOnTheScreen();
      expect(screen.queryByLabelText('Nome da tag')).not.toBeOnTheScreen();
    });

    it('Should say the tag could not be loaded when the read fails', async () => {
      await renderPage(HEALTH_TAG_ID, { service: tagListQueryService, status: 'error' }, fiveBills);

      expect(screen.getByText('Não deu para carregar a tag.')).toBeOnTheScreen();
    });
  });
});
