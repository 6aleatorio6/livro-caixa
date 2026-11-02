import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { addContributionService } from '@/shared/services/entry/add/addContributionService';
import { addContributionScenarios } from '@/shared/services/entry/add/addContributionService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { entryQueryScenarios } from '@/shared/services/entry/query/entryQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';

import { ContributePage } from './ContributePage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryQueryService', () => ({ entryQueryService: {} }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));
jest.mock('@/shared/services/entry/add/addContributionService', () => ({ addContributionService: jest.fn() }));
jest.mock('@/shared/utils/file/pickReceiptFile', () => ({ pickReceiptFile: jest.fn() }));
jest.mock('@/shared/utils/file/prepareReceipt', () => ({ prepareReceipt: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), dismissTo: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

// A Ana contribui na Luz que o Bruno pagou, R$ 187,35, em que ela já tinha posto R$ 40,00.
const contribution = addContributionScenarios.memberContributesToPaidEntry;
const [input] = contribution.input;
const RECEIPT_BUTTON = 'Comprovante: Nenhum arquivo anexado. Escolher';
const SUBMIT = 'Registrar contribuição';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.adminSignsIn));
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: '2026-10_electricity' });
  jest
    .mocked(pickReceiptFile)
    .mockResolvedValue({ uri: 'file:///x', name: 'x.png', contentType: 'image/png', sizeBytes: 10 });
  jest.mocked(prepareReceipt).mockResolvedValue(input.receipt);
});

async function renderPage() {
  mockRealtime(
    { service: entryQueryService, scenario: entryQueryScenarios.paymentOfTheMember },
    { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithContributionToPayment },
    { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList },
    { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags },
    // O nome de quem está logado, no aviso: a Ana, ou o Bruno.
    { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.adminInList },
    { service: allowedEmailQueryService, scenario: allowedEmailQueryScenarios.emailInList },
  );
  await render(<ContributePage />);
  return userEvent.setup();
}

async function typeAmount(user: Awaited<ReturnType<typeof renderPage>>, digits: string) {
  await user.type(screen.getByLabelText('Quanto você contribuiu'), digits);
  // O rótulo do campo sobe animado: a animação termina dentro do `act`.
  await act(async () => {});
}

describe('ContributePage', () => {
  it("Should contribute to a paid entry from its page, with the payer's entry on top", async () => {
    mockServiceScenario(addContributionService, contribution);
    const user = await renderPage();

    expect(screen.getByText('Pagamento de Bruno · outubro')).toBeOnTheScreen();
    expect(screen.getByText('Luz')).toBeOnTheScreen();
    expect(screen.getByText('R$ 187,35 · Bruno fica com R$ 147,35')).toBeOnTheScreen();
    await typeAmount(user, String(input.amountCents));
    expect(screen.getByText('Fica no seu nome, Ana. Bruno passa a ficar com R$ 107,35.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(addContributionService).toHaveBeenCalledWith(...contribution.input);
    expect(showToast).toHaveBeenCalledWith('Contribuição registrada.', 'success');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('Should refuse a contribution above what is left to receive', async () => {
    const user = await renderPage();

    await typeAmount(user, '14736');
    await user.press(screen.getByRole('button', { name: RECEIPT_BUTTON }));
    await user.press(screen.getByRole('button', { name: SUBMIT }));

    expect(await screen.findByText('A contribuição passa do que falta, R$ 147,35.')).toBeOnTheScreen();
    expect(addContributionService).not.toHaveBeenCalled();
  });

  it('Should not let whoever registered the entry contribute to it', async () => {
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
    await renderPage();

    expect(
      screen.getByText('Você registrou este lançamento: quem contribui nele são os outros membros.'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: SUBMIT })).not.toBeOnTheScreen();
  });
});
