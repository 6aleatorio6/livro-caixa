import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { oneOffBillTagIdsQueryService } from '@/shared/services/entry/query/oneOffBillTagIdsQueryService';
import { oneOffBillTagIdsQueryScenarios } from '@/shared/services/entry/query/oneOffBillTagIdsQueryService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';

import { TagsPage } from './TagsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/entry/query/oneOffBillTagIdsQueryService', () => ({ oneOffBillTagIdsQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const oneOffBills = {
  service: oneOffBillTagIdsQueryService,
  scenario: oneOffBillTagIdsQueryScenarios.oneOffBillsWithTags,
};
const noOneOffBills = {
  service: oneOffBillTagIdsQueryService,
  scenario: oneOffBillTagIdsQueryScenarios.noOneOffBills,
};
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };

describe('TagsPage', () => {
  it('Should list the tags by name with how many recurring bills use each one', async () => {
    mockRealtime(threeTags, fiveBills, noOneOffBills);
    await render(<TagsPage />);

    const names = screen.getAllByText(/^(Casa|Saúde|Serviços)$/).map((node) => node.props.children);
    expect(names).toEqual(['Casa', 'Saúde', 'Serviços']);
    expect(screen.getByText('2 contas recorrentes')).toBeOnTheScreen();
    expect(screen.getByText('Sem uso')).toBeOnTheScreen();
    expect(screen.getByText('3 contas recorrentes')).toBeOnTheScreen();
  });

  it('Should show both counts, only the non-zero ones, and Sem uso when both are zero', async () => {
    mockRealtime(threeTags, fiveBills, oneOffBills);
    await render(<TagsPage />);

    expect(screen.getByText('2 contas recorrentes · 2 contas avulsas')).toBeOnTheScreen();
    expect(screen.getByText('3 contas recorrentes · 1 conta avulsa')).toBeOnTheScreen();
    expect(screen.getByText('Sem uso')).toBeOnTheScreen();
  });

  it('Should show only the one-off count for a tag used by one-off bills alone', async () => {
    mockRealtime(
      threeTags,
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.noBills },
      oneOffBills,
    );
    await render(<TagsPage />);

    expect(screen.getByText('2 contas avulsas')).toBeOnTheScreen();
    expect(screen.getByText('1 conta avulsa')).toBeOnTheScreen();
    expect(screen.getByText('Sem uso')).toBeOnTheScreen();
  });

  it('Should open the tag when its row is pressed', async () => {
    mockRealtime(threeTags, fiveBills, noOneOffBills);
    await render(<TagsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Serviços' }));

    expect(router.push).toHaveBeenCalledWith('/tags/servicos');
  });

  it('Should open the new tag screen when Nova tag is pressed', async () => {
    mockRealtime(threeTags, fiveBills, noOneOffBills);
    await render(<TagsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Nova tag' }));

    expect(router.push).toHaveBeenCalledWith('/tags/new');
  });

  it('Should say there is no tag yet and still offer to create one', async () => {
    mockRealtime({ service: tagListQueryService, scenario: tagListQueryScenarios.noTagsDocument }, fiveBills, noOneOffBills);
    await render(<TagsPage />);

    expect(screen.getByText('Nenhuma tag ainda.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nova tag' })).toBeOnTheScreen();
  });

  it('Should show no list while the tags are loading', async () => {
    mockRealtime({ service: tagListQueryService, status: 'loading' }, fiveBills, noOneOffBills);
    await render(<TagsPage />);

    expect(screen.queryByText('Casa')).not.toBeOnTheScreen();
    expect(screen.queryByText('Nenhuma tag ainda.')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the read fails', async () => {
    mockRealtime({ service: tagListQueryService, status: 'error' }, fiveBills, noOneOffBills);
    await render(<TagsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
  });

  it('Should not guess the use of a tag while the recurring bills are not read', async () => {
    mockRealtime(threeTags, { service: recurringBillListQueryService, status: 'loading' }, noOneOffBills);
    await render(<TagsPage />);

    expect(screen.getByText('Casa')).toBeOnTheScreen();
    expect(screen.queryByText('Sem uso')).not.toBeOnTheScreen();
  });

  it('Should not guess the use of a tag while the one-off bills are not read', async () => {
    mockRealtime(threeTags, fiveBills, { service: oneOffBillTagIdsQueryService, status: 'loading' });
    await render(<TagsPage />);

    expect(screen.getByText('Casa')).toBeOnTheScreen();
    expect(screen.queryByText('Sem uso')).not.toBeOnTheScreen();
    expect(screen.queryByText('2 contas recorrentes')).not.toBeOnTheScreen();
  });

  it('Should show the tag another person creates while the screen is open', async () => {
    const realtime = mockRealtime(
      { service: tagListQueryService, scenario: tagListQueryScenarios.tagAddedWhileOpen },
      fiveBills,
      noOneOffBills,
    );
    await render(<TagsPage />);
    expect(screen.queryByText('Mercado')).not.toBeOnTheScreen();

    await act(async () => realtime.applyChange(tagListQueryService));

    expect(screen.getByText('Mercado')).toBeOnTheScreen();
  });
});
