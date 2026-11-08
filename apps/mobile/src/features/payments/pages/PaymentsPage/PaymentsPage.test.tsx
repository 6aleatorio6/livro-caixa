import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';

import { PaymentsPage } from './PaymentsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
// Ana, Bruno e Clara já entraram; a Elisa ainda não, e não ganha chip.
const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyWithPersonNotEntered };
const october = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithEntries };
// Em novembro o mês anterior é outubro, o primeiro do app: os testes da troca para o mês anterior abrem em novembro,
// porque em outubro o botão está desabilitado.
const november = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.nextMonthPaidEarly };

/** O botão da linha de uma conta: o rótulo dele é o nome, o texto de apoio e o valor, e este começa pelo nome. */
const rowOf = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name},`) });

/** O chip "Todos" e os de todas as pessoas, marcados. */
function expectEveryChipSelected() {
  for (const name of ['Todos', 'Você', 'Ana', 'Clara']) {
    expect(screen.getByRole('button', { name })).toBeSelected();
  }
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

describe('PaymentsPage', () => {
  it('Should list only the entries of the signed-in member, under the header of their tag', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Pagamentos')).toBeOnTheScreen();
    expect(screen.getByText('Casa')).toBeOnTheScreen();
    expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa')).toBeOnTheScreen();
    expect(screen.queryByText('Mercado')).not.toBeOnTheScreen();
    expect(screen.queryByText('Estacionamento')).not.toBeOnTheScreen();
  });

  it('Should open the details of an entry when its row is pressed', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    await userEvent.setup().press(rowOf('Farmácia'));

    expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]', params: { id: 'pharmacy' } });
  });

  it('Should hint that a row can be pressed only when the month has entries', async () => {
    mockRealtime(october, threeTags, family);
    const { unmount } = await render(<PaymentsPage />);
    expect(screen.getByText('Toque num lançamento para ver os detalhes e o comprovante.')).toBeOnTheScreen();
    await unmount();

    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.queryByText('Toque num lançamento para ver os detalhes e o comprovante.')).not.toBeOnTheScreen();
  });

  it('Should show the sum of the member entries and their share of the family month', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Sua parte em outubro')).toBeOnTheScreen();
    // Bruno: R$ 89,90 de R$ 354,90 da família.
    expect(screen.getByText('1 lançamento · 25% do que a família pagou')).toBeOnTheScreen();
    // No cartão, no total do grupo Casa e na linha da Farmácia.
    expect(screen.getAllByText('R$ 89,90')).toHaveLength(3);
  });

  it('Should sum all the entries of the member, not only the first, against the whole family month', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithTwoEntriesOfTheMember },
      threeTags,
      family,
    );
    await render(<PaymentsPage />);

    // Bruno: R$ 89,90 + R$ 10,10 de R$ 400,00 da família (a Ana pagou R$ 300,00).
    expect(screen.getByText('R$ 100,00')).toBeOnTheScreen();
    expect(screen.getByText('2 lançamentos · 25% do que a família pagou')).toBeOnTheScreen();
    expect(screen.getByText('Padaria')).toBeOnTheScreen();
    expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    expect(screen.queryByText('Mercado')).not.toBeOnTheScreen();
  });

  it('Should list a payment of the member with the payment date and the expected value when it differs, counted in the total', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPaymentOfTheMember },
      threeTags,
      family,
    );
    await render(<PaymentsPage />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('pago em 15/10 · previsto R$ 119,90')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa')).toBeOnTheScreen();
    // Bruno: R$ 125,00 + R$ 89,90, no cartão e no total do grupo Casa, onde estão os dois.
    expect(screen.getAllByText('R$ 214,90')).toHaveLength(2);
    expect(screen.getByText('2 lançamentos · 100% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should keep the expected amount of the payment when the bill changed afterwards', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithPaymentOfAlteredBill },
      threeTags,
      family,
    );
    await render(<PaymentsPage />);

    expect(screen.getByText('pago em 10/10 · previsto R$ 250,00')).toBeOnTheScreen();
  });

  it('Should show only the date for an entry without tag', async () => {
    mockRealtime(
      { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.previousMonthWithEntries },
      threeTags,
      family,
    );
    jest.setSystemTime(new Date(2026, 8, 15));
    await render(<PaymentsPage />);

    expect(screen.getByText('30/09 · avulsa')).toBeOnTheScreen();
  });

  it('Should show the empty state without the total card when the member has no entry in the month', async () => {
    mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Nenhum pagamento seu em outubro')).toBeOnTheScreen();
    expect(
      screen.getByText('Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Sua parte em outubro')).not.toBeOnTheScreen();
  });

  it('Should read the previous month when the previous month is pressed', async () => {
    jest.setSystemTime(new Date(2026, 10, 25));
    mockRealtime(november, threeTags, family);
    await render(<PaymentsPage />);
    const user = userEvent.setup();

    mockRealtime(october, threeTags, family);
    await user.press(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(screen.getByText('Outubro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    expect(screen.getByText('Sua parte em outubro')).toBeOnTheScreen();
    expect(screen.queryByText('Condomínio')).not.toBeOnTheScreen();
  });

  // O pagamento do próximo mês feito antes de o mês começar aparece lá, não no mês em que foi feito.
  it('Should go to the next month and stop there', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);
    const user = userEvent.setup();

    mockRealtime(november, threeTags, family);
    await user.press(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(screen.getByText('Novembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Condomínio')).toBeOnTheScreen();
    expect(screen.getByText('pago em 28/10')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled();
  });

  it('Should show the loading state while the list loads', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'loading' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();
  });

  it('Should not show the loading state once the month arrives or when the read fails', async () => {
    mockRealtime(october, threeTags, family);
    const { unmount } = await render(<PaymentsPage />);
    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
    await unmount();

    mockRealtime({ service: entryMonthQueryService, status: 'error' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
  });

  it('Should show neither the list nor the empty state while the month loads', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'loading' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.queryByText('Sua parte em outubro')).not.toBeOnTheScreen();
    expect(screen.queryByText('Nenhum pagamento seu em outubro')).not.toBeOnTheScreen();
    expect(screen.queryByText('Não deu para carregar a lista.')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the read fails', async () => {
    mockRealtime({ service: entryMonthQueryService, status: 'error' }, threeTags, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(screen.queryByText('Nenhum pagamento seu em outubro')).not.toBeOnTheScreen();
  });

  describe('Chips of the family', () => {
    it('Should open on "Você" and offer "Todos" and who already entered the app', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      expect(screen.getByRole('button', { name: 'Você' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Todos' })).not.toBeSelected();
      expect(screen.getByRole('button', { name: 'Ana' })).not.toBeSelected();
      const chips = screen.getAllByRole('button', { name: /^(Todos|Você|Ana|Clara|Elisa.*)$/ });
      expect(chips.map((chip) => chip.props.accessibilityLabel)).toEqual(['Todos', 'Você', 'Ana', 'Clara']);
    });

    it('Should show the entries of the whole family, grouped by tag, with who paid each one, when "Todos" is pressed', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Todos' }));

      expectEveryChipSelected();
      const headers = screen.getAllByText(/^(Casa|Serviços|Sem tag)$/).map((node) => node.props.children);
      expect(headers).toEqual(['Casa', 'Serviços', 'Sem tag']);
      expect(screen.getByText('12/10 · avulsa · Bruno')).toBeOnTheScreen();
      expect(screen.getByText('20/10 · avulsa · Ana')).toBeOnTheScreen();
      expect(screen.getByText('12/10 · avulsa · Ana')).toBeOnTheScreen();
    });

    // A porcentagem da família sobre ela mesma seria sempre 100%: o cartão não a mostra.
    it('Should show the family total without the share when "Todos" is pressed', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Todos' }));

      expect(screen.getByText('A família registrou em outubro')).toBeOnTheScreen();
      expect(screen.getByText('R$ 354,90')).toBeOnTheScreen();
      expect(screen.getByText('3 lançamentos')).toBeOnTheScreen();
    });

    it('Should say nobody paid in the month when "Todos" is pressed on an empty month', async () => {
      mockRealtime({ service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth }, threeTags, family);
      await render(<PaymentsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Todos' }));

      expect(screen.getByText('Nenhum pagamento em outubro')).toBeOnTheScreen();
      expect(screen.getByText('Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.')).toBeOnTheScreen();
    });

    // O chip de outra pessoa marca mais uma, em vez de trocar a escolhida: para ver só a Ana, desmarca-se o "Você".
    it('Should show only the entries of another member, grouped by tag, when hers is the only chip marked', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();

      await user.press(screen.getByRole('button', { name: 'Ana' }));
      await user.press(screen.getByRole('button', { name: 'Você' }));

      expect(screen.getByRole('button', { name: 'Ana' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Você' })).not.toBeSelected();
      // Ana: Mercado (Serviços, R$ 250,00) e Estacionamento (sem tag, R$ 15,00), de R$ 354,90 da família.
      expect(screen.getByText('Parte de Ana em outubro')).toBeOnTheScreen();
      expect(screen.getByText('2 lançamentos · 74% do que a família pagou')).toBeOnTheScreen();
      const headers = screen.getAllByText(/^(Casa|Serviços|Sem tag)$/).map((node) => node.props.children);
      expect(headers).toEqual(['Serviços', 'Sem tag']);
      expect(screen.getByText('Mercado')).toBeOnTheScreen();
      expect(screen.getByText('Estacionamento')).toBeOnTheScreen();
      expect(screen.queryByText('Farmácia')).not.toBeOnTheScreen();
    });

    it('Should open the details of an entry of another member', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();

      await user.press(screen.getByRole('button', { name: 'Ana' }));
      await user.press(rowOf('Mercado'));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]', params: { id: 'market' } });
    });

    it('Should say another member has no entry in the month, without the text for whoever is signed in', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();

      await user.press(screen.getByRole('button', { name: 'Clara' }));
      await user.press(screen.getByRole('button', { name: 'Você' }));

      expect(screen.getByText('Nenhum pagamento de Clara em outubro')).toBeOnTheScreen();
      expect(screen.queryByText(/Quando você registrar/)).not.toBeOnTheScreen();
      expect(screen.queryByText('Parte de Clara em outubro')).not.toBeOnTheScreen();
    });

    it('Should add the person of the chip pressed to the ones marked, and sum their parts under their names', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);

      await userEvent.setup().press(screen.getByRole('button', { name: 'Ana' }));

      expect(screen.getByRole('button', { name: 'Você' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Ana' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Todos' })).not.toBeSelected();
      // Bruno: Farmácia (R$ 89,90); Ana: Mercado (R$ 250,00) e Estacionamento (R$ 15,00); R$ 354,90 da família.
      expect(screen.getByText('Partes de Você e Ana em outubro')).toBeOnTheScreen();
      expect(screen.getByText('R$ 354,90')).toBeOnTheScreen();
      expect(screen.getByText('3 lançamentos · 100% do que a família pagou')).toBeOnTheScreen();
    });

    // Se a última marcada desmarcasse, o "Você" voltaria a valer no lugar da Ana, e o toque trocaria de pessoa.
    it('Should keep the last marked chip marked when it is pressed, whoever it is', async () => {
      mockRealtime(october, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();
      await user.press(screen.getByRole('button', { name: 'Ana' }));
      await user.press(screen.getByRole('button', { name: 'Você' }));

      await user.press(screen.getByRole('button', { name: 'Ana' }));

      expect(screen.getByRole('button', { name: 'Ana' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Você' })).not.toBeSelected();
      expect(screen.getByText('Parte de Ana em outubro')).toBeOnTheScreen();
    });

    it('Should keep the marked chips when the month changes', async () => {
      jest.setSystemTime(new Date(2026, 10, 25));
      mockRealtime(november, threeTags, family);
      await render(<PaymentsPage />);
      const user = userEvent.setup();
      await user.press(screen.getByRole('button', { name: 'Ana' }));

      mockRealtime(october, threeTags, family);
      await user.press(screen.getByRole('button', { name: 'Mês anterior' }));

      // Outubro tem o Mercado e o Estacionamento da Ana e a Farmácia do Bruno.
      expect(screen.getByRole('button', { name: 'Ana' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'Você' })).toBeSelected();
      expect(screen.getByText('Partes de Você e Ana em outubro')).toBeOnTheScreen();
      expect(screen.getByText('Mercado')).toBeOnTheScreen();
      expect(screen.getByText('Farmácia')).toBeOnTheScreen();
    });
  });

  it('Should go back to "Você" when the only marked person leaves the list while the screen is open', async () => {
    const realtime = mockRealtime(october, threeTags, {
      service: allowedEmailListQueryService,
      scenario: allowedEmailListQueryScenarios.personRemovedWhileOpen,
    });
    await render(<PaymentsPage />);
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Clara' }));
    await user.press(screen.getByRole('button', { name: 'Você' }));
    expect(screen.getByText('Nenhum pagamento de Clara em outubro')).toBeOnTheScreen();

    await act(async () => realtime.applyChange(allowedEmailListQueryService));

    expect(screen.queryByRole('button', { name: 'Clara' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Você' })).toBeSelected();
    expect(screen.getByText('Sua parte em outubro')).toBeOnTheScreen();
  });

  it('Should wait for the tags before listing, so no entry shows as untagged', async () => {
    mockRealtime(october, { service: tagListQueryService, status: 'loading' }, family);
    await render(<PaymentsPage />);

    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();
    expect(screen.queryByText('Sem tag')).not.toBeOnTheScreen();
    expect(screen.queryByText('Farmácia')).not.toBeOnTheScreen();
  });

  it('Should say the list could not be loaded when the tags fail', async () => {
    mockRealtime(october, { service: tagListQueryService, status: 'error' }, family);
    await render(<PaymentsPage />);

    expect(screen.getByText('Não deu para carregar a lista.')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
  });

  it('Should open the new one-off bill screen when Nova conta avulsa is pressed', async () => {
    mockRealtime(october, threeTags, family);
    await render(<PaymentsPage />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Nova conta avulsa' }));

    expect(router.push).toHaveBeenCalledWith('/one-off-bills/new');
  });

  // A Luz de R$ 187,35 que o Bruno pagou, com R$ 40,00 da Ana; o Bruno está logado. Cada parte é uma linha: a do
  // Bruno, R$ 147,35, e a contribuição da Ana, R$ 40,00.
  describe('Contributions', () => {
    const lightWithContribution = {
      service: entryMonthQueryService,
      scenario: entryMonthQueryScenarios.monthWithContributionToPayment,
    };

    async function renderWithContribution() {
      mockRealtime(lightWithContribution, threeTags, family);
      await render(<PaymentsPage />);
      return userEvent.setup();
    }

    it('Should mark everybody under Todos and show the Luz twice, the part of who paid and the contribution', async () => {
      const user = await renderWithContribution();

      await user.press(screen.getByRole('button', { name: 'Todos' }));

      expectEveryChipSelected();
      expect(screen.getAllByText('Luz')).toHaveLength(2);
      expect(screen.getByText('pago em 10/10 · parte de Bruno')).toBeOnTheScreen();
      expect(screen.getByText('R$ 147,35')).toBeOnTheScreen();
      expect(screen.getByText('contribuição em 11/10 · Ana')).toBeOnTheScreen();
      expect(screen.getByText('R$ 40,00')).toBeOnTheScreen();
      // Sem a porcentagem: a família sobre ela mesma seria 100%. O cartão e o total da tag somam as duas linhas.
      expect(screen.getByText('A família registrou em outubro')).toBeOnTheScreen();
      expect(screen.getByText('2 lançamentos')).toBeOnTheScreen();
      expect(screen.getAllByText('R$ 187,35')).toHaveLength(2);
    });

    it('Should show only the part of who is signed in, without the contribution, when only "Você" is marked', async () => {
      await renderWithContribution();

      expect(screen.getByText('Sua parte em outubro')).toBeOnTheScreen();
      expect(screen.getByText('1 lançamento · 78% do que a família pagou')).toBeOnTheScreen();
      expect(screen.getAllByText('Luz')).toHaveLength(1);
      expect(screen.getByText('pago em 10/10 · sua parte')).toBeOnTheScreen();
      // O cartão, o total da tag e a linha: os três são a parte do Bruno.
      expect(screen.getAllByText('R$ 147,35')).toHaveLength(3);
      expect(screen.queryByText('R$ 40,00')).not.toBeOnTheScreen();
      expect(screen.queryByText(/contribuição em/)).not.toBeOnTheScreen();
    });

    it('Should sum the two parts on the card when "Você" and Ana are marked', async () => {
      const user = await renderWithContribution();

      await user.press(screen.getByRole('button', { name: 'Ana' }));

      expect(screen.getByText('Partes de Você e Ana em outubro')).toBeOnTheScreen();
      // Os R$ 147,35 do Bruno e os R$ 40,00 da Ana são os R$ 187,35 que a família pagou: o cartão e o total da tag.
      expect(screen.getAllByText('R$ 187,35')).toHaveLength(2);
      expect(screen.getByText('2 lançamentos · 100% do que a família pagou')).toBeOnTheScreen();
      expect(screen.getAllByText('Luz')).toHaveLength(2);
    });

    it('Should show only the contribution, in the tag of the bill, when only the contributor is marked', async () => {
      const user = await renderWithContribution();

      await user.press(screen.getByRole('button', { name: 'Ana' }));
      await user.press(screen.getByRole('button', { name: 'Você' }));

      expect(screen.getByText('Parte de Ana em outubro')).toBeOnTheScreen();
      expect(screen.getByText('1 lançamento · 21% do que a família pagou')).toBeOnTheScreen();
      expect(screen.getByText('Serviços')).toBeOnTheScreen();
      expect(screen.getAllByText('Luz')).toHaveLength(1);
      expect(screen.getByText('contribuição em 11/10 · para Bruno')).toBeOnTheScreen();
      expect(screen.getAllByText('R$ 40,00')).toHaveLength(3);
      expect(screen.queryByText(/sua parte|parte de Bruno/)).not.toBeOnTheScreen();
    });

    it('Should open the details of the contribution from its row and those of the payment from the row of the payer', async () => {
      const user = await renderWithContribution();
      await user.press(screen.getByRole('button', { name: 'Todos' }));
      // As duas partes têm o mesmo nome: o rótulo de cada botão traz o apoio e o valor.
      const paymentRow = screen.getByRole('button', { name: 'Luz, pago em 10/10 · parte de Bruno, R$ 147,35' });
      const contributionRow = screen.getByRole('button', { name: 'Luz, contribuição em 11/10 · Ana, R$ 40,00' });

      await user.press(contributionRow);
      expect(router.push).toHaveBeenLastCalledWith({ pathname: '/entries/[id]', params: { id: 'c-ana' } });

      await user.press(paymentRow);
      expect(router.push).toHaveBeenLastCalledWith({
        pathname: '/entries/[id]',
        params: { id: '2026-10_electricity' },
      });
    });

    // A Ana cobriu a Luz inteira do Bruno: a parte dele é R$ 0,00, mas é o pagamento que ele registrou, e ele o
    // edita ou apaga por essa linha.
    it("Should keep the payer's part at zero, opening the payment, when the contributions cover the whole bill", async () => {
      mockRealtime(
        { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithFullyContributedPayment },
        threeTags,
        family,
      );
      await render(<PaymentsPage />);

      expect(screen.getByText('Sua parte em outubro')).toBeOnTheScreen();
      expect(screen.getByText('1 lançamento · 0% do que a família pagou')).toBeOnTheScreen();
      // O cartão, o total da tag e a linha.
      expect(screen.getAllByText('R$ 0,00')).toHaveLength(3);
      await userEvent.setup().press(screen.getByRole('button', { name: 'Luz, pago em 10/10 · sua parte, R$ 0,00' }));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]', params: { id: '2026-10_electricity' } });
    });

    it('Should show the lone contribution to a month with no owner under the chip of who contributed, and open it', async () => {
      mockRealtime(
        { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithContributionToUnownedPayment },
        threeTags,
        family,
      );
      await render(<PaymentsPage />);
      const user = userEvent.setup();
      await user.press(screen.getByRole('button', { name: 'Ana' }));
      await user.press(screen.getByRole('button', { name: 'Você' }));

      expect(screen.getByText('Parte de Ana em outubro')).toBeOnTheScreen();
      expect(screen.getByText('contribuição em 11/10')).toBeOnTheScreen();
      expect(screen.getAllByText('R$ 50,00')).toHaveLength(3);
      await user.press(rowOf('Internet'));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]', params: { id: 'c-ana' } });
    });
  });
});
