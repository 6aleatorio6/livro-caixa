import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { createTagService } from '@/shared/services/tag/create/createTagService';
import { createTagRejectedScenarios, createTagScenarios } from '@/shared/services/tag/create/createTagService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import type { ITag } from '@/shared/types/tag/Tag';

import { NewTagPage } from './NewTagPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/tag/create/createTagService', () => ({ createTagService: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NewTagPage', () => {
  async function renderPage(scenario: (typeof tagListQueryScenarios)[keyof typeof tagListQueryScenarios] = tagListQueryScenarios.threeTags) {
    mockRealtime({ service: tagListQueryService, scenario });
    await render(<NewTagPage />);
    return userEvent.setup();
  }

  async function typeName(user: Awaited<ReturnType<typeof renderPage>>, name: string) {
    await user.type(screen.getByLabelText('Nome da tag'), name);
  }

  it('Should create the tag with the name trimmed and the color chosen, say so and go back', async () => {
    const scenario = createTagScenarios.memberCreatesTag;
    mockServiceScenario(createTagService, scenario);
    const user = await renderPage();

    await typeName(user, `  ${scenario.input[0].name}  `);
    await user.press(screen.getByRole('radio', { name: 'Petróleo' }));
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(createTagService).toHaveBeenCalledWith(...scenario.input);
    expect(showToast).toHaveBeenCalledWith('Tag criada', 'success');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('Should start with Madeira chosen, so the first tag of the family needs no color click', async () => {
    const scenario = createTagScenarios.memberCreatesFirstTag;
    mockServiceScenario(createTagService, scenario);
    const user = await renderPage(tagListQueryScenarios.noTagsDocument);
    expect(screen.getByRole('radio', { name: 'Madeira' })).toBeChecked();

    await typeName(user, scenario.input[0].name);
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(createTagService).toHaveBeenCalledWith(...scenario.input);
  });

  it('Should keep only the color chosen last', async () => {
    const user = await renderPage();

    await user.press(screen.getByRole('radio', { name: 'Lavanda' }));
    await user.press(screen.getByRole('radio', { name: 'Azul' }));

    expect(screen.getByRole('radio', { name: 'Azul' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Lavanda' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Madeira' })).not.toBeChecked();
  });

  it('Should show the name typed in the preview', async () => {
    const user = await renderPage();

    await typeName(user, ' Mercado ');

    // O campo guarda o texto no valor; só a prévia o tem como texto.
    expect(screen.getByText('Mercado')).toBeOnTheScreen();
  });

  it('Should refuse an empty name and stay on the screen', async () => {
    const user = await renderPage();

    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
    expect(createTagService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should create a tag with a name of 30 characters', async () => {
    const user = await renderPage();

    await typeName(user, 'a'.repeat(30));
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(createTagService).toHaveBeenCalledWith({ name: 'a'.repeat(30), color: 'wood' });
  });

  it('Should refuse a name of 31 characters and stay on the screen', async () => {
    const user = await renderPage();

    await typeName(user, 'a'.repeat(31));
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(await screen.findByText('Use no máximo 30 caracteres.')).toBeOnTheScreen();
    expect(createTagService).not.toHaveBeenCalled();
  });

  it.each([
    { case: 'without the accent', rejected: createTagRejectedScenarios.nameOfAnotherTagWithoutAccent },
    { case: 'in upper case, with spaces around', rejected: createTagRejectedScenarios.nameOfAnotherTagInUpperCase },
  ])('Should refuse the name of another tag $case, naming the tag as it is stored', async ({ rejected }) => {
    const user = await renderPage();

    await typeName(user, rejected.input[0].name);
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(await screen.findByText(rejected.result.userMessage)).toBeOnTheScreen();
    expect(createTagService).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should call the service once when the button is pressed twice while saving', async () => {
    let resolveSave!: () => void;
    jest.mocked(createTagService).mockReturnValue(
      new Promise<ITag>((resolve) => {
        resolveSave = () => resolve({ id: 'mercado', ...createTagScenarios.memberCreatesTag.result });
      }),
    );
    const user = await renderPage();

    await typeName(user, 'Mercado');
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(createTagService).toHaveBeenCalledTimes(1);
    await act(async () => resolveSave());
  });

  it('Should show the refusal of the service and stay on the screen when another person took the name first', async () => {
    const rejected = createTagRejectedScenarios.nameOfAnotherTagWithoutAccent;
    mockServiceRejection(createTagService, rejected);
    const user = await renderPage();

    await typeName(user, 'Mercado');
    await user.press(screen.getByRole('button', { name: 'Criar tag' }));

    expect(showToast).toHaveBeenCalledWith(rejected.result.userMessage, 'error');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('Should not let the tag be created before the list is read', async () => {
    mockRealtime({ service: tagListQueryService, status: 'loading' });
    await render(<NewTagPage />);

    expect(screen.getByRole('button', { name: 'Criar tag' })).toBeDisabled();
  });

  it('Should say the list could not be loaded when the read fails', async () => {
    mockRealtime({ service: tagListQueryService, status: 'error' });
    await render(<NewTagPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(useRealtime).toHaveBeenCalledWith(tagListQueryService, tagListQueryScenarios.threeTags.input);
  });
});
