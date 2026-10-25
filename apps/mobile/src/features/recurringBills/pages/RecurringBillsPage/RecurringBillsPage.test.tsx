import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';

import { RecurringBillsPage } from './RecurringBillsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };

describe('RecurringBillsPage', () => {
  it('Should list the bills by day with the day, the tag and the expected amount', async () => {
    mockRealtime(fiveBills, threeTags);
    await render(<RecurringBillsPage />);

    expect(screen.getByText('todo dia 5 · Casa')).toBeOnTheScreen();
    expect(screen.getByText('todo dia 8 · Casa')).toBeOnTheScreen();
    expect(screen.getByText('todo dia 10 · Serviços')).toBeOnTheScreen();
    expect(screen.getByText('todo dia 15 · Serviços')).toBeOnTheScreen();
    expect(screen.getByText('todo dia 20 · Serviços')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.800,00')).toBeOnTheScreen();
    expect(screen.getByText('R$ 119,90')).toBeOnTheScreen();
    const names = screen.getAllByText(/^(Aluguel|Condomínio|Luz|Internet|Água)$/).map((node) => node.props.children);
    expect(names).toEqual(['Aluguel', 'Condomínio', 'Luz', 'Internet', 'Água']);
  });

  it('Should show the total expected per month and how many bills there are', async () => {
    mockRealtime(fiveBills, threeTags);
    await render(<RecurringBillsPage />);

    expect(screen.getByText('Previsto por mês')).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.677,90')).toBeOnTheScreen();
    expect(screen.getByText('5 contas recorrentes')).toBeOnTheScreen();
  });

  it('Should open the bill when its row is pressed', async () => {
    mockRealtime(fiveBills, threeTags);
    await render(<RecurringBillsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: /^Internet/ }));

    expect(router.push).toHaveBeenCalledWith('/recurring-bills/internet');
  });

  it('Should open the new bill screen when Nova conta recorrente is pressed', async () => {
    mockRealtime(fiveBills, threeTags);
    await render(<RecurringBillsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Nova conta recorrente' }));

    expect(router.push).toHaveBeenCalledWith('/recurring-bills/new');
  });

  it('Should show zero and no bill, and still offer to add one, when the family has none', async () => {
    mockRealtime({ service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.noBills }, threeTags);
    await render(<RecurringBillsPage />);

    expect(screen.getByText('R$ 0,00')).toBeOnTheScreen();
    expect(screen.getByText('Nenhuma conta recorrente')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nova conta recorrente' })).toBeOnTheScreen();
  });

  it('Should show only the day for a bill without tag', async () => {
    mockRealtime(
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billWithoutTag },
      threeTags,
    );
    await render(<RecurringBillsPage />);

    expect(screen.getByText('todo dia 25')).toBeOnTheScreen();
  });

  it('Should show only the day for a bill whose tag is no longer in the list', async () => {
    mockRealtime(fiveBills, { service: tagListQueryService, scenario: tagListQueryScenarios.emptyTagsDocument });
    await render(<RecurringBillsPage />);

    expect(screen.getByText('todo dia 5')).toBeOnTheScreen();
    expect(screen.queryByText(/Casa/)).not.toBeOnTheScreen();
  });

  it('Should show no list and no total while the bills are loading', async () => {
    mockRealtime({ service: recurringBillListQueryService, status: 'loading' }, threeTags);
    await render(<RecurringBillsPage />);

    expect(screen.queryByText('Previsto por mês')).not.toBeOnTheScreen();
    expect(screen.queryByText('Nenhuma conta recorrente')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the read fails', async () => {
    mockRealtime({ service: recurringBillListQueryService, status: 'error' }, threeTags);
    await render(<RecurringBillsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
  });

  it('Should update the list and the total when another person adds a bill with the screen open', async () => {
    const realtime = mockRealtime(
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billAddedWhileOpen },
      threeTags,
    );
    await render(<RecurringBillsPage />);
    expect(screen.queryByText('Gás')).not.toBeOnTheScreen();

    await act(async () => realtime.applyChange(recurringBillListQueryService));

    expect(screen.getByText('Gás')).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.797,90')).toBeOnTheScreen();
    expect(screen.getByText('6 contas recorrentes')).toBeOnTheScreen();
  });
});
