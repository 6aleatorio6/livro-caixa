import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useFocusEffect } from 'expo-router';
import { getSharedPayloads } from 'expo-sharing';

import { mockRealtimeWithSummaryReads } from '@/shared/testing/mockRealtimeWithSummaryReads';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { overdueMonthQueryService } from '@/shared/services/overdueMonth/query/overdueMonthQueryService';
import { overdueMonthQueryScenarios } from '@/shared/services/overdueMonth/query/overdueMonthQueryService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { recurringBillListQueryScenarios } from '@/shared/services/recurringBill/query/recurringBillListQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import type { IRealtimeMock } from '@/shared/types/testing/RealtimeMock';
import { checkAppVersion } from '@/shared/utils/version/checkAppVersion';

import { HomePage } from './HomePage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/overdueMonth/query/overdueMonthQueryService', () => ({ overdueMonthQueryService: {} }));
jest.mock('@/shared/services/overdueMonth/query/overdueSourcesQueryService', () => ({
  overdueSourcesQueryService: {},
}));
jest.mock('@/shared/services/recurringBill/query/recurringBillListQueryService', () => ({
  recurringBillListQueryService: {},
}));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));
jest.mock('expo-router', () => ({ router: { push: jest.fn() }, useFocusEffect: jest.fn() }));
// A conferência da versão tem teste próprio e carregaria o serviço de leitura; é assíncrona, como a verdadeira.
jest.mock('@/shared/utils/version/checkAppVersion', () => ({ checkAppVersion: jest.fn(() => Promise.resolve()) }));
// O compartilhamento que o Android deixou para o app, lido pelo Início ao abrir.
jest.mock('expo-sharing', () => ({ getSharedPayloads: jest.fn(() => []) }));

const fiveBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.fiveBills };
const noBills = { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.noBills };
const billWithoutTag = {
  service: recurringBillListQueryService,
  scenario: recurringBillListQueryScenarios.billWithoutTag,
};
const waterAndElectricity = {
  service: recurringBillListQueryService,
  scenario: recurringBillListQueryScenarios.billsOnTheSameDay,
};
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const renamedFamily = {
  service: allowedEmailListQueryService,
  scenario: allowedEmailListQueryScenarios.familyWithRenamedMember,
};
const familyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthOfTheFamily };
// Em novembro o mês anterior é outubro, o primeiro do app: os testes da troca para o mês anterior abrem em novembro,
// porque em outubro o botão está desabilitado.
const november = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.nextMonthPaidEarly };
const novemberWithOverduePayment = {
  service: entryMonthQueryService,
  scenario: entryMonthQueryScenarios.monthWithOverduePayment,
};
const emptyMonth = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };

const octoberWithSkippedBill = {
  service: overdueMonthQueryService,
  scenario: overdueMonthQueryScenarios.monthWithSkippedBill,
};

// Novembro é o mês atual: a Luz de outubro foi paga e a Água de outubro, não. Em novembro o mês anterior é outubro, o
// primeiro do app, que `shouldSwitchToPreviousMonth` abre. A Água e a Luz vencem no dia 20.
async function renderNovember(
  overrides: { bills?: IRealtimeMock; entries?: IRealtimeMock; shouldSwitchToPreviousMonth?: boolean } = {},
) {
  const { bills = waterAndElectricity, entries = november, shouldSwitchToPreviousMonth = false } = overrides;
  jest.setSystemTime(new Date(2026, 10, 25));
  mockRealtimeWithSummaryReads(bills, threeTags, family, entries);
  await render(<HomePage />);
  if (!shouldSwitchToPreviousMonth) return;

  mockRealtimeWithSummaryReads(bills, threeTags, family, familyMonth);
  await userEvent.setup().press(screen.getByRole('button', { name: 'Mês anterior' }));
}

beforeEach(() => {
  jest.clearAllMocks();
  // "Hoje" fixo, de outubro de 2026; o relógio segue andando para as animações não travarem.
  jest.useFakeTimers({
    now: new Date(2026, 9, 25),
    advanceTimers: true,
    doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'],
  });
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('HomePage', () => {
  describe('The app version check', () => {
    it('Should check the app version each time the home gains focus', async () => {
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
      await render(<HomePage />);
      const onFocus = jest.mocked(useFocusEffect).mock.lastCall![0];

      onFocus();
      onFocus();

      expect(checkAppVersion).toHaveBeenCalledTimes(2);
    });

    // O `useFocusEffect` só aceita uma função ou nada de volta: a promessa da conferência avisaria no console.
    it('Should return nothing to the focus effect, which warns about a promise', async () => {
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
      await render(<HomePage />);
      const onFocus = jest.mocked(useFocusEffect).mock.lastCall![0];

      expect(onFocus()).toBeUndefined();
    });
  });

  describe('A file shared to the app', () => {
    it('Should open the share screen when a shared file is waiting', async () => {
      jest
        .mocked(getSharedPayloads)
        .mockReturnValue([{ value: 'content://x/pix.pdf', shareType: 'file', mimeType: 'application/pdf' }] as never);
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);

      await render(<HomePage />);

      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith('/share-receipt');
    });

    it('Should not open the share screen when nothing was shared', async () => {
      jest.mocked(getSharedPayloads).mockReturnValue([]);
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);

      await render(<HomePage />);

      expect(router.push).not.toHaveBeenCalled();
    });
  });

  it('Should show the same numbers to Ana and to Bruno', async () => {
    const numbers = ['R$ 217,90', 'R$ 2.787,35', 'R$ 3.005,25', '2 de 6 contas'];
    const found: string[][] = [];

    for (const scenario of [signInWithFakeGoogleScenarios.adminSignsIn, signInWithFakeGoogleScenarios.memberSignsIn]) {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(scenario));
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
      const { unmount } = await render(<HomePage />);
      found.push(numbers.filter((text) => screen.queryAllByText(text).length > 0));
      await unmount();
    }

    expect(found[0]).toEqual(numbers);
    expect(found[1]).toEqual(numbers);
  });

  it('Should count the payments and the one-off bill as paid and the bills without payment as to pay', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByText('Outubro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Falta pagar')).toBeOnTheScreen();
    expect(screen.getByText('2 de 6 contas')).toBeOnTheScreen();
    expect(screen.getByText('2 contas · R$ 217,90')).toBeOnTheScreen();
    expect(screen.getByText('4 contas · R$ 2.787,35')).toBeOnTheScreen();
    expect(screen.getByText('R$ 3.005,25')).toBeOnTheScreen();
  });

  it('Should list the bills to pay by expected amount and due day, before the paid ones', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByText('R$ 119,90 · vence dia 15')).toBeOnTheScreen();
    expect(screen.getByText('R$ 98,00 · vence dia 20')).toBeOnTheScreen();
    const titles = screen.getAllByRole('header').map((node) => node.props.children);
    expect(titles).toEqual(['A pagar', 'Pagas']);
  });

  it('Should list the paid ones by day, with who paid and the expected amount when it differs', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByText('dia 5 · Ana')).toBeOnTheScreen();
    expect(screen.getByText('dia 8 · Bruno')).toBeOnTheScreen();
    expect(screen.getByText('dia 10 · Ana · previsto R$ 210,00')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa · Bruno')).toBeOnTheScreen();
    const names = screen
      .getAllByText(/^(Aluguel|Condomínio|Luz|Conserto da geladeira)$/)
      .map((node) => node.props.children);
    expect(names).toEqual(['Aluguel', 'Condomínio', 'Luz', 'Conserto da geladeira']);
  });

  it('Should keep the due day and the expected amount of the payment when the bill changed afterwards', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.monthWithPaymentOfAlteredBill,
    });
    await render(<HomePage />);

    expect(screen.getByText('dia 3 · Bruno · previsto R$ 250,00')).toBeOnTheScreen();
    expect(screen.queryByText('dia 10 · Bruno · previsto R$ 210,00')).not.toBeOnTheScreen();
  });

  it('Should split what was paid by tag, with what is still to pay', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.getByRole('tab', { name: 'Por tag', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.600,00')).toBeOnTheScreen();
    // Na linha da tag Serviços e na da Luz.
    expect(screen.getAllByText('R$ 187,35')).toHaveLength(2);
    expect(screen.getByText('e mais R$ 217,90 a pagar')).toBeOnTheScreen();
  });

  it('Should show "Sem tag" last in the split by tag, with what has no tag', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.monthWithEntries,
    });
    await render(<HomePage />);

    // Serviços pagou R$ 250,00 e Casa R$ 89,90; o Estacionamento, sem tag, R$ 15,00, e mesmo assim vem por último.
    const names = screen.getAllByText(/^(Casa|Serviços|Sem tag)$/).map((node) => node.props.children);
    expect(names).toEqual(['Serviços', 'Casa', 'Sem tag']);
    // Na linha Sem tag e na do Estacionamento, entre as pagas.
    expect(screen.getAllByText('R$ 15,00')).toHaveLength(2);
  });

  it('Should not put everything in "Sem tag" while the tags load', async () => {
    mockRealtimeWithSummaryReads(fiveBills, { service: tagListQueryService, status: 'loading' }, family, familyMonth);
    await render(<HomePage />);

    expect(screen.queryByText('Sem tag')).not.toBeOnTheScreen();
  });

  it('Should split what was paid by member with the current name of the person', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, renamedFamily, familyMonth);
    await render(<HomePage />);

    await userEvent.setup().press(screen.getByRole('tab', { name: 'Por membro' }));

    expect(screen.getByRole('tab', { name: 'Por membro', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('Ana')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.987,35')).toBeOnTheScreen();
    expect(screen.getByText('Bruno')).toBeOnTheScreen();
    expect(screen.getByText('R$ 800,00')).toBeOnTheScreen();
  });

  it('Should show the numbers of the previous month when the month is changed', async () => {
    await renderNovember({ bills: fiveBills, shouldSwitchToPreviousMonth: true });

    expect(screen.getByText('Outubro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('R$ 3.005,25')).toBeOnTheScreen();
    expect(screen.getByText('2 de 6 contas')).toBeOnTheScreen();
  });

  it('Should show the bills to pay of the next month, and no month after it', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, november);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Próximo mês' }));

    // O Condomínio, pago em outubro, conta em novembro; as outras quatro contas estão a pagar.
    expect(screen.getByText('Novembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('4 de 5 contas')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.800,00 · vence dia 5')).toBeOnTheScreen();
    expect(screen.getByText('dia 8 · Bruno')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled();
  });

  // O exemplo de novembro da página Contribuição: R$ 2.300,00 pagos, com a Luz a pagar pelo que falta.
  it('Should count the contributions in the month, in the rows and in the split by member', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.monthWithContributions,
    });
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(screen.getAllByText('R$ 2.300,00').length).toBeGreaterThan(0);
    expect(screen.getByText('faltam R$ 100,00 · R$ 100,00 de Ana · dia 20')).toBeOnTheScreen();
    expect(screen.getByText('dia 15 · Ana · R$ 40,00 de Bruno')).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.000,00')).toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'Por membro' }));

    // A Ana fica com R$ 80,00 da Internet, R$ 100,00 da Luz e R$ 50,00 da Farmácia; a Carla não está na lista.
    expect(screen.getByText('R$ 230,00')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.040,00')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.030,00')).toBeOnTheScreen();
  });

  it('Should show all bills to pay and a zero paid when the month has no entries', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, emptyMonth);
    await render(<HomePage />);

    // No centro do anel e no total do mês.
    expect(screen.getAllByText('R$ 2.677,90')).toHaveLength(2);
    expect(screen.getByText('5 de 5 contas')).toBeOnTheScreen();
    expect(screen.queryByText('Pagas')).not.toBeOnTheScreen();
  });

  it('Should show the closed month when every bill is paid', async () => {
    mockRealtimeWithSummaryReads(
      { service: recurringBillListQueryService, scenario: recurringBillListQueryScenarios.billWithDeletedTag },
      threeTags,
      family,
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPayment },
    );
    await render(<HomePage />);

    expect(screen.getByText('Mês fechado')).toBeOnTheScreen();
    expect(screen.getByText('Tudo pago')).toBeOnTheScreen();
  });

  it('Should offer to register the bills when the family has none', async () => {
    mockRealtimeWithSummaryReads(noBills, threeTags, family, emptyMonth);
    await render(<HomePage />);

    expect(screen.getByText('Sem contas')).toBeOnTheScreen();
    expect(screen.getByText('Nenhuma conta recorrente ainda')).toBeOnTheScreen();
    expect(screen.queryByText('A pagar')).not.toBeOnTheScreen();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Cadastrar contas recorrentes' }));

    expect(router.push).toHaveBeenCalledWith('/recurring-bills');
  });

  it('Should open the payment of the bill with the month of the screen when Pagar is pressed', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Pagar Internet' }));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/recurring-bills/[id]/pay',
      params: { id: 'internet', month: '2026-10' },
    });
  });

  it('Should open the details of a paid entry when its row is pressed', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Aluguel, Casa' }));
    await user.press(screen.getByRole('button', { name: 'Conserto da geladeira, Casa' }));

    expect(router.push).toHaveBeenNthCalledWith(1, { pathname: '/entries/[id]', params: { id: '2026-10_rent' } });
    expect(router.push).toHaveBeenNthCalledWith(2, { pathname: '/entries/[id]', params: { id: 'fridge' } });
  });

  it('Should bring a bill back to to pay when its payment is deleted with the screen open', async () => {
    const realtime = mockRealtimeWithSummaryReads(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.paymentDeletedWhileOpen,
    });
    await render(<HomePage />);
    expect(screen.queryByRole('button', { name: 'Pagar Internet' })).not.toBeOnTheScreen();
    expect(screen.getByText('dia 15 · Ana')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.getByRole('button', { name: 'Pagar Internet' })).toBeOnTheScreen();
    expect(screen.queryByText('dia 15 · Ana')).not.toBeOnTheScreen();
  });

  it('Should not offer to add a one-off bill', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
    await render(<HomePage />);

    expect(screen.queryByText('Nova conta avulsa')).not.toBeOnTheScreen();
  });

  it('Should show nothing of the month while it is loading', async () => {
    mockRealtimeWithSummaryReads({ service: recurringBillListQueryService, status: 'loading' }, threeTags, family, {
      service: entryMonthQueryService,
      status: 'loading',
    });
    await render(<HomePage />);

    expect(screen.queryByText('Falta pagar')).not.toBeOnTheScreen();
    expect(screen.queryByText('Sem contas')).not.toBeOnTheScreen();
  });

  it('Should say the month could not be loaded when the read fails', async () => {
    mockRealtimeWithSummaryReads(fiveBills, threeTags, family, { service: entryMonthQueryService, status: 'error' });
    await render(<HomePage />);

    expect(screen.getByText('Não deu para carregar o mês.')).toBeOnTheScreen();
  });

  it('Should move a bill from to pay to paid when its payment arrives with the screen open', async () => {
    const realtime = mockRealtimeWithSummaryReads(fiveBills, threeTags, family, {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.paymentAddedWhileOpen,
    });
    await render(<HomePage />);
    expect(screen.getByRole('button', { name: 'Pagar Internet' })).toBeOnTheScreen();
    expect(screen.queryByText('dia 15 · Ana')).not.toBeOnTheScreen();

    await act(async () => realtime.applyChange(entryMonthQueryService));

    expect(screen.queryByRole('button', { name: 'Pagar Internet' })).not.toBeOnTheScreen();
    expect(screen.getByText('dia 15 · Ana')).toBeOnTheScreen();
  });

  describe('Overdue bills', () => {
    it('Should list the overdue bill first, with its badge and the day it was due, and count it in the summary', async () => {
      await renderNovember();

      expect(screen.getByText('3 contas · R$ 406,00')).toBeOnTheScreen();
      expect(screen.getAllByText('De outubro')).toHaveLength(1);
      const supports = screen.getAllByText(/ dia 20$/).map((node) => node.props.children);
      expect(supports).toEqual(['R$ 98,00 · venceu dia 20', 'R$ 98,00 · vence dia 20', 'R$ 210,00 · vence dia 20']);
    });

    it('Should open the payment with the month of the bill, not the month of the screen', async () => {
      await renderNovember();
      const user = userEvent.setup();
      await user.press(screen.getByRole('button', { name: 'Pagar Água de outubro' }));
      await user.press(screen.getByRole('button', { name: 'Pagar Água' }));

      expect(router.push).toHaveBeenNthCalledWith(1, {
        pathname: '/recurring-bills/[id]/pay',
        params: { id: 'water', month: '2026-10' },
      });
      expect(router.push).toHaveBeenNthCalledWith(2, {
        pathname: '/recurring-bills/[id]/pay',
        params: { id: 'water', month: '2026-11' },
      });
    });

    it('Should mark as overdue, in its own month, a bill that was not paid there', async () => {
      await renderNovember({ bills: fiveBills, shouldSwitchToPreviousMonth: true });

      expect(screen.getByRole('button', { name: 'Internet, Atrasada, Serviços' })).toBeOnTheScreen();
      expect(screen.getByText('R$ 119,90 · venceu dia 15')).toBeOnTheScreen();
      expect(screen.queryByText(/^De /)).not.toBeOnTheScreen();
    });

    it('Should show the overdue payment as paid, with a gray badge from the month of the bill and the day it was paid', async () => {
      await renderNovember({ bills: billWithoutTag, entries: novemberWithOverduePayment });

      expect(screen.getByRole('button', { name: 'Água, De outubro, Serviços' })).toBeOnTheScreen();
      expect(screen.getByText('paga dia 5 · Ana')).toBeOnTheScreen();
      expect(screen.getByText('1 conta · R$ 90,00')).toBeOnTheScreen();
    });

    it('Should show no badge and no skipped section in a month with no overdue bill', async () => {
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth);
      await render(<HomePage />);

      expect(screen.queryByText('Atrasada')).not.toBeOnTheScreen();
      expect(screen.queryByText(/^De /)).not.toBeOnTheScreen();
      expect(screen.queryByText('Puladas')).not.toBeOnTheScreen();
    });
  });

  describe('Skipped bills', () => {
    async function renderOctoberWithSkippedBill() {
      mockRealtimeWithSummaryReads(fiveBills, threeTags, family, familyMonth, octoberWithSkippedBill);
      await render(<HomePage />);
    }

    it('Should list the skipped bill after the ones to pay, with who skipped it and no amount', async () => {
      await renderOctoberWithSkippedBill();

      const titles = screen.getAllByRole('header').map((node) => node.props.children);
      expect(titles).toEqual(['A pagar', 'Puladas', 'Pagas']);
      expect(screen.getByText('1 conta')).toBeOnTheScreen();
      expect(screen.getByText('pulada por Ana · não conta no mês')).toBeOnTheScreen();
      // A bolinha da tag vai no detalhe, como nas outras linhas; o leitor de tela lê o nome dela.
      expect(screen.getByRole('button', { name: 'Internet, Casa' })).toBeOnTheScreen();
      expect(screen.queryByText(/119,90/)).not.toBeOnTheScreen();
    });

    it('Should not count the skipped bill in the month', async () => {
      await renderOctoberWithSkippedBill();

      // A Água é a única a pagar, entre as cinco contas do mês: a Internet, pulada, não conta.
      expect(screen.getByText('1 conta · R$ 98,00')).toBeOnTheScreen();
      expect(screen.getByText('1 de 5 contas')).toBeOnTheScreen();
    });

    it('Should open the payment of the skipped bill with its month when its row is pressed', async () => {
      await renderOctoberWithSkippedBill();

      await userEvent.setup().press(screen.getByRole('button', { name: 'Internet, Casa' }));

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/recurring-bills/[id]/pay',
        params: { id: 'internet', month: '2026-10' },
      });
    });
  });
});
