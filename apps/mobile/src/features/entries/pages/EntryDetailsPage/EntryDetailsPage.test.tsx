import { act, render, screen, userEvent, within } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { showToast } from '@/core/utils/storeActions/showToast';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { deleteEntryService } from '@/shared/services/entry/deleteEntryService';
import {
  deleteEntryRejectedScenarios,
  deleteEntryScenarios,
} from '@/shared/services/entry/deleteEntryService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryMonthQueryScenarios } from '@/shared/services/entry/query/entryMonthQueryService.scenarios';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { entryQueryScenarios } from '@/shared/services/entry/query/entryQueryService.scenarios';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { receiptFileQueryScenarios } from '@/shared/services/file/query/receiptFileQueryService.scenarios';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import type { IRealtimeMock } from '@/shared/types/testing/RealtimeMock';

import { EntryDetailsPage } from './EntryDetailsPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryQueryService', () => ({ entryQueryService: {} }));
jest.mock('@/shared/services/entry/query/entryMonthQueryService', () => ({ entryMonthQueryService: {} }));
jest.mock('@/shared/services/file/query/receiptFileQueryService', () => ({ receiptFileQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({ allowedEmailListQueryService: {} }));
jest.mock('@/shared/services/tag/query/tagListQueryService', () => ({ tagListQueryService: {} }));
jest.mock('@/shared/services/entry/deleteEntryService', () => ({ deleteEntryService: jest.fn() }));
// O aviso se esconde num timer de 4 s, que seguraria o Jest depois do teste.
jest.mock('@/core/utils/storeActions/showToast', () => ({ showToast: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() }, useLocalSearchParams: jest.fn() }));

const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const threeTags = { service: tagListQueryService, scenario: tagListQueryScenarios.threeTags };
const pdfReceipt = { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.pdfReceipt };
const imageReceipt = { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.imageReceipt };
const payment = { service: entryQueryService, scenario: entryQueryScenarios.paymentOfTheMember };
const oneOffBill = { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillOfTheMember };
// O mês do lançamento, sem contribuições: o padrão de toda folha que não diz outro.
const monthWithoutContributions = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.emptyMonth };
const monthWithContribution = {
  service: entryMonthQueryService,
  scenario: entryMonthQueryScenarios.monthWithContributionToPayment,
};
const contributionReceipt = {
  service: receiptFileQueryService,
  scenario: receiptFileQueryScenarios.contributionReceipt,
};

// O mock do lançamento lido pelo id: o `id` do cenário é o da rota.
type IEntryMock = IRealtimeMock & { scenario: { input: { id: string } } };

const bruno = signInWithFakeGoogleScenarios.memberSignsIn;
const ana = signInWithFakeGoogleScenarios.adminSignsIn;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(bruno));
});

describe('EntryDetailsPage', () => {
  async function renderDetails(entry: IEntryMock, ...others: Parameters<typeof mockRealtime>) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: entry.scenario.input.id });
    // O mês sem contribuições vai por último: o mês que o teste dá, com a mesma entrada, vem antes e vale.
    const realtime = mockRealtime(entry, ...others, monthWithoutContributions);
    await render(<EntryDetailsPage />);
    return { user: userEvent.setup(), realtime };
  }

  async function confirmDeletion(user: Awaited<ReturnType<typeof renderDetails>>['user']) {
    await user.press(screen.getByRole('button', { name: 'Excluir' }));
    await user.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Excluir' }));
  }

  describe('The payment', () => {
    it('Should show the bill, the month, the paid and the expected amount, who paid, when, the due day and the tag', async () => {
      await renderDetails(payment, pdfReceipt, family, threeTags);

      expect(screen.getByText('Luz')).toBeOnTheScreen();
      expect(screen.getByText('Pagamento de outubro de 2026')).toBeOnTheScreen();
      expect(screen.getByText('R$ 187,35')).toBeOnTheScreen();
      expect(screen.getByText('previsto R$ 210,00')).toBeOnTheScreen();
      expect(screen.getByText('Pago por')).toBeOnTheScreen();
      expect(screen.getByText('Bruno')).toBeOnTheScreen();
      expect(screen.getByText('10/10/2026')).toBeOnTheScreen();
      expect(screen.getByText('dia 10')).toBeOnTheScreen();
      expect(screen.getByText('Serviços')).toBeOnTheScreen();
    });

    it('Should show the receipt of another member and let anyone open it', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(ana));
      const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

      expect(screen.getByText('PDF · 88 KB')).toBeOnTheScreen();
      expect(screen.getByText('comprovante-luz.pdf')).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: /^Comprovante: comprovante-luz.pdf/ }));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]/receipt', params: { id: '2026-10_electricity' } });
    });

    it('Should update the amount when the payment is corrected with the sheet open', async () => {
      const { realtime } = await renderDetails(payment, pdfReceipt, family, threeTags);
      expect(screen.getByText('R$ 187,35')).toBeOnTheScreen();

      await act(async () => realtime.applyChange(entryQueryService));

      expect(screen.getByText('R$ 200,00')).toBeOnTheScreen();
    });
  });

  describe('The one-off bill', () => {
    it('Should show the one-off layout: the type, the amount, who registered, the date and the tag, with no expected amount', async () => {
      await renderDetails(oneOffBill, imageReceipt, family, threeTags);

      expect(screen.getByText('Conserto da geladeira')).toBeOnTheScreen();
      expect(screen.getByText('Conta avulsa')).toBeOnTheScreen();
      expect(screen.getByText('R$ 350,00')).toBeOnTheScreen();
      expect(screen.getByText('Registrado por')).toBeOnTheScreen();
      expect(screen.getByText('Bruno')).toBeOnTheScreen();
      expect(screen.getByText('Data')).toBeOnTheScreen();
      expect(screen.getByText('12/10/2026')).toBeOnTheScreen();
      expect(screen.getByText('Casa')).toBeOnTheScreen();
      expect(screen.queryByText(/^previsto/)).not.toBeOnTheScreen();
      expect(screen.queryByText('Vencimento')).not.toBeOnTheScreen();
    });

    it('Should leave out the tag row for a bill without tag', async () => {
      await renderDetails(
        { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillWithoutTag },
        imageReceipt,
        family,
        threeTags,
      );

      expect(screen.getByText('Conserto da geladeira')).toBeOnTheScreen();
      expect(screen.queryByText('Tag')).not.toBeOnTheScreen();
    });
  });

  describe('The receipt', () => {
    it('Should keep Ver off when the receipt record is missing', async () => {
      await renderDetails(
        { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillWithoutTag },
        { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.missingReceiptFile },
        family,
        threeTags,
      );

      expect(screen.getByRole('button', { name: 'Comprovante: Nenhum arquivo anexado. Ver' })).toBeDisabled();
    });
  });

  describe('Who may change it', () => {
    it('Should offer Alterar and Excluir to whoever registered the payment', async () => {
      await renderDetails(payment, pdfReceipt, family, threeTags);

      expect(screen.getByRole('button', { name: 'Alterar' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Excluir' })).toBeOnTheScreen();
      expect(screen.queryByText(/pode alterar ou excluir/)).not.toBeOnTheScreen();
    });

    it('Should offer neither to another member and say who can, for a payment', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(ana));
      await renderDetails(payment, pdfReceipt, family, threeTags);

      expect(screen.queryByRole('button', { name: 'Alterar' })).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeOnTheScreen();
      expect(screen.getByText('Só Bruno pode alterar ou excluir este pagamento.')).toBeOnTheScreen();
    });

    it('Should offer neither to another member and say who can, for a one-off bill', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(ana));
      await renderDetails(oneOffBill, imageReceipt, family, threeTags);

      expect(screen.queryByRole('button', { name: 'Alterar' })).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeOnTheScreen();
      expect(screen.getByText('Só Bruno pode alterar ou excluir esta conta.')).toBeOnTheScreen();
    });

    it('Should open the edit screen when Alterar is pressed', async () => {
      const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

      await user.press(screen.getByRole('button', { name: 'Alterar' }));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/entries/[id]/edit', params: { id: '2026-10_electricity' } });
    });
  });

  describe('Deleting', () => {
    it('Should ask first and call the service only after the dialog is confirmed', async () => {
      const scenario = deleteEntryScenarios.memberDeletesPayment;
      mockServiceScenario(deleteEntryService, scenario);
      const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

      await user.press(screen.getByRole('button', { name: 'Excluir' }));

      expect(screen.getByText('Excluir o pagamento da Luz?')).toBeOnTheScreen();
      expect(
        screen.getByText('A Luz de outubro volta a aparecer como a pagar no Início, e o comprovante é apagado.'),
      ).toBeOnTheScreen();
      expect(deleteEntryService).not.toHaveBeenCalled();

      await user.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Excluir' }));

      expect(deleteEntryService).toHaveBeenCalledWith(...scenario.input);
    });

    it('Should not delete when the dialog is cancelled', async () => {
      const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

      await user.press(screen.getByRole('button', { name: 'Excluir' }));
      await user.press(screen.getByRole('button', { name: 'Cancelar' }));

      expect(deleteEntryService).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });

    it('Should close the sheet and say the payment was deleted', async () => {
      mockServiceScenario(deleteEntryService, deleteEntryScenarios.memberDeletesPayment);
      const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

      await confirmDeletion(user);

      expect(router.back).toHaveBeenCalledTimes(1);
      expect(showToast).toHaveBeenCalledWith('Pagamento excluído.', 'success');
    });

    it('Should ask about the one-off bill with its own texts, close the sheet and say it was deleted', async () => {
      const scenario = deleteEntryScenarios.memberDeletesOneOffBill;
      mockServiceScenario(deleteEntryService, scenario);
      const { user } = await renderDetails(oneOffBill, imageReceipt, family, threeTags);

      await user.press(screen.getByRole('button', { name: 'Excluir' }));
      expect(screen.getByText('Excluir a conta avulsa Conserto da geladeira?')).toBeOnTheScreen();
      expect(screen.getByText('A conta avulsa sai do mês, e o comprovante é apagado.')).toBeOnTheScreen();
      await user.press(within(screen.getByTestId('confirm-dialog')).getByRole('button', { name: 'Excluir' }));

      expect(deleteEntryService).toHaveBeenCalledWith(...scenario.input);
      expect(router.back).toHaveBeenCalledTimes(1);
      expect(showToast).toHaveBeenCalledWith('Conta avulsa excluída.', 'success');
    });

    it('Should keep the sheet open and warn when the deletion is refused', async () => {
      const refusal = deleteEntryRejectedScenarios.memberDeletesEntryDeletedMeanwhile;
      mockServiceRejection(deleteEntryService, refusal);
      const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

      await confirmDeletion(user);

      expect(deleteEntryService).toHaveBeenCalledWith(...refusal.input);
      expect(router.back).not.toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith(refusal.result.userMessage, 'error');
    });
  });

  describe('Contributions', () => {
    it('Should show who contributed and how much the payer keeps in the details', async () => {
      await renderDetails(payment, pdfReceipt, contributionReceipt, family, threeTags, monthWithContribution);

      // A Luz de R$ 187,35 do Bruno, com R$ 40,00 da Ana.
      expect(screen.getByText('Fica com você')).toBeOnTheScreen();
      expect(screen.getByText('R$ 147,35')).toBeOnTheScreen();
      expect(screen.getByRole('header', { name: 'Contribuições' })).toBeOnTheScreen();
      expect(screen.getByText('(R$ 40,00)')).toBeOnTheScreen();
      expect(screen.getByText('Ana · 11/10')).toBeOnTheScreen();
      expect(screen.getByText('R$ 40,00')).toBeOnTheScreen();
    });

    it('Should not offer Contribuir to whoever registered the entry, and keep Excluir off while it has contributions', async () => {
      await renderDetails(payment, pdfReceipt, contributionReceipt, family, threeTags, monthWithContribution);

      expect(screen.queryByRole('button', { name: 'Contribuir' })).not.toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled();
      expect(screen.getByText('Com contribuições, o pagamento não pode ser excluído.')).toBeOnTheScreen();
    });

    it('Should offer Contribuir to another member and open the contribution to the entry', async () => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(ana));
      const { user } = await renderDetails(
        payment,
        pdfReceipt,
        contributionReceipt,
        family,
        threeTags,
        monthWithContribution,
      );

      expect(screen.getByText('Fica com Bruno')).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: 'Contribuir' }));

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/entries/[id]/contribute',
        params: { id: '2026-10_electricity' },
      });
    });

    it("Should keep Excluir off for the author until the month's entries arrive", async () => {
      const monthLoading = { service: entryMonthQueryService, status: 'loading' as const };
      await renderDetails(payment, pdfReceipt, family, threeTags, monthLoading);

      expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled();
    });

    it("Should offer no Ver for a contribution in an entry's details: the entry's own receipt is the only one", async () => {
      const { user } = await renderDetails(
        payment,
        pdfReceipt,
        contributionReceipt,
        family,
        threeTags,
        monthWithContribution,
      );

      expect(screen.queryByText('pix-luz-ana.jpg')).not.toBeOnTheScreen();
      const receipts = screen.getAllByRole('button', { name: /^Comprovante:/ });
      expect(receipts).toHaveLength(1);
      await user.press(receipts[0]);

      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/entries/[id]/receipt',
        params: { id: '2026-10_electricity' },
      });
    });

    describe('A bill paid only by contributions', () => {
      const reachedRent = { service: entryQueryService, scenario: entryQueryScenarios.reachedUnownedPayment };
      const november = { service: entryMonthQueryService, scenario: entryMonthQueryScenarios.monthWithContributions };

      it('Should disable Contribuir when the contributions reached the expected amount, and say why', async () => {
        await renderDetails(reachedRent, family, threeTags, november);

        expect(screen.getByText('R$ 2.000,00')).toBeOnTheScreen();
        expect(screen.getByText('Chegaram ao previsto, então não dá para contribuir mais.')).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Contribuir' })).toBeDisabled();
        expect(screen.queryByRole('button', { name: 'Alterar' })).not.toBeOnTheScreen();
        expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeOnTheScreen();
      });

      it('Should list each contribution as a text line, with no receipt of its own', async () => {
        await renderDetails(reachedRent, family, threeTags, november);

        // O Bruno contribuiu no dia 4, e a Carla, que a lista da família não tem (então "Alguém"), no dia 5.
        expect(screen.getByText('Bruno · 04/11')).toBeOnTheScreen();
        expect(screen.getByText('Alguém · 05/11')).toBeOnTheScreen();
        expect(screen.getAllByText('R$ 1.000,00')).toHaveLength(2);
        expect(screen.queryAllByRole('button', { name: /^Comprovante:/ })).toHaveLength(0);
      });

      it('Should open the payment of the month from "Anexar o comprovante da conta"', async () => {
        const { user } = await renderDetails(reachedRent, family, threeTags, november);

        await user.press(screen.getByRole('button', { name: 'Anexar o comprovante da conta' }));

        expect(router.push).toHaveBeenCalledWith({
          pathname: '/recurring-bills/[id]/pay',
          params: { id: 'rent', month: '2026-11', attach: '1' },
        });
      });
    });

    describe("A contribution's own details", () => {
      const contribution = { service: entryQueryService, scenario: entryQueryScenarios.contribution };
      const contributionToUnownedPayment = {
        service: entryQueryService,
        scenario: entryQueryScenarios.contributionToUnownedPayment,
      };
      const monthWithContributionToUnownedPayment = {
        service: entryMonthQueryService,
        scenario: entryMonthQueryScenarios.monthWithContributionToUnownedPayment,
      };
      const contributionToOneOffBill = {
        service: entryQueryService,
        scenario: entryQueryScenarios.contributionToOneOffBill,
      };
      const monthWithContributionToOneOffBill = {
        service: entryMonthQueryService,
        scenario: entryMonthQueryScenarios.monthWithContributionToOneOffBill,
      };

      // A folha da contribuição da Ana na Luz do Bruno, com o comprovante dela e o do pagamento; `overrides` troca a
      // contribuição, o mês e o comprovante da conta.
      function renderContribution(
        overrides: { entry?: IEntryMock; month?: IRealtimeMock; billReceipt?: IRealtimeMock } = {},
      ) {
        const { entry = contribution, month = monthWithContribution, billReceipt = pdfReceipt } = overrides;
        return renderDetails(entry, contributionReceipt, billReceipt, family, threeTags, month);
      }

      it('Should show the contribution with the payment sheet, with Alterar and Excluir for its author', async () => {
        jest.mocked(useAuthState).mockReturnValue(signedInAuthState(ana));
        await renderContribution();

        expect(screen.getByText('Luz')).toBeOnTheScreen();
        expect(screen.getByText('Contribuição em outubro de 2026')).toBeOnTheScreen();
        expect(screen.getByText('R$ 40,00')).toBeOnTheScreen();
        expect(screen.getByText('na conta Luz de R$ 187,35, paga por Bruno')).toBeOnTheScreen();
        expect(screen.getByText('Contribuído por')).toBeOnTheScreen();
        expect(screen.getByText('dia 10')).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Alterar' })).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Excluir' })).toBeEnabled();
      });

      it('Should say the bill is still to pay when the contribution went to a month with no owner', async () => {
        await renderContribution({ entry: contributionToUnownedPayment, month: monthWithContributionToUnownedPayment });

        expect(screen.getByText('na conta Internet de R$ 120,00, ainda a pagar')).toBeOnTheScreen();
      });

      it("Should show the contribution's receipt and then the payment's, each with its heading", async () => {
        await renderContribution();

        expect(screen.getByText('Comprovante da contribuição')).toBeOnTheScreen();
        expect(screen.getByText('Comprovante do pagamento')).toBeOnTheScreen();
        const receipts = screen.getAllByRole('button', { name: /^Comprovante:/ });
        expect(receipts).toHaveLength(2);
        expect(receipts[0]).toHaveAccessibleName('Comprovante: pix-luz-ana.jpg. Ver');
        expect(receipts[1]).toHaveAccessibleName('Comprovante: comprovante-luz.pdf. Ver');
      });

      it("Should call the second receipt the one-off bill's when the contribution went to a one-off bill", async () => {
        await renderContribution({
          entry: contributionToOneOffBill,
          month: monthWithContributionToOneOffBill,
          billReceipt: imageReceipt,
        });

        expect(screen.getByText('na conta Conserto da geladeira de R$ 350,00, paga por Bruno')).toBeOnTheScreen();
        expect(screen.getByText('Comprovante da contribuição')).toBeOnTheScreen();
        expect(screen.getByText('Comprovante da conta avulsa')).toBeOnTheScreen();
        expect(screen.queryByText('Comprovante do pagamento')).not.toBeOnTheScreen();
      });

      it('Should open each receipt with the id of the entry it belongs to', async () => {
        const { user } = await renderContribution();

        await user.press(screen.getByRole('button', { name: /^Comprovante: pix-luz-ana.jpg/ }));
        expect(router.push).toHaveBeenLastCalledWith({ pathname: '/entries/[id]/receipt', params: { id: 'c-ana' } });

        await user.press(screen.getByRole('button', { name: /^Comprovante: comprovante-luz.pdf/ }));
        expect(router.push).toHaveBeenLastCalledWith({
          pathname: '/entries/[id]/receipt',
          params: { id: '2026-10_electricity' },
        });
        expect(router.push).toHaveBeenCalledTimes(2);
      });

      it("Should show only the contribution's receipt when the payment it goes to has no owner", async () => {
        await renderContribution({ entry: contributionToUnownedPayment, month: monthWithContributionToUnownedPayment });

        expect(screen.getByText('Comprovante da contribuição')).toBeOnTheScreen();
        expect(screen.queryByText('Comprovante do pagamento')).not.toBeOnTheScreen();
        expect(screen.getAllByRole('button', { name: /^Comprovante:/ })).toHaveLength(1);
      });

      it('Should say who can change it to another member', async () => {
        await renderContribution();

        expect(screen.getByText('Só Ana pode alterar ou excluir esta contribuição.')).toBeOnTheScreen();
        expect(screen.queryByRole('button', { name: 'Alterar' })).not.toBeOnTheScreen();
      });

      it("Should delete the contribution with the month's entries and say so", async () => {
        jest.mocked(useAuthState).mockReturnValue(signedInAuthState(ana));
        const deletion = deleteEntryScenarios.memberDeletesContributionToPaidEntry;
        mockServiceScenario(deleteEntryService, deletion);
        const { user } = await renderContribution();

        await confirmDeletion(user);

        expect(deleteEntryService).toHaveBeenCalledWith(...deletion.input);
        expect(showToast).toHaveBeenCalledWith('Contribuição excluída.', 'success');
        expect(router.back).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('The entry is missing or fails to load', () => {
    it('Should say the entry was deleted when the author deletes it in another device with the sheet open', async () => {
      const { realtime } = await renderDetails(
        { service: entryQueryService, scenario: entryQueryScenarios.deletedEntry },
        imageReceipt,
        family,
        threeTags,
      );
      expect(screen.getByText('Conserto da geladeira')).toBeOnTheScreen();

      await act(async () => realtime.applyChange(entryQueryService));

      expect(screen.getByText('Este lançamento foi excluído.')).toBeOnTheScreen();
      expect(screen.queryByText('Conserto da geladeira')).not.toBeOnTheScreen();
    });

    it('Should say the entry was deleted for an id that does not exist', async () => {
      await renderDetails({ service: entryQueryService, scenario: entryQueryScenarios.missingEntry }, family, threeTags);

      expect(screen.getByText('Este lançamento foi excluído.')).toBeOnTheScreen();
    });

    it('Should say the entry could not be loaded when the read fails', async () => {
      jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'fridge' });
      mockRealtime({ service: entryQueryService, status: 'error' }, family, threeTags);
      await render(<EntryDetailsPage />);

      expect(screen.getByText('Não deu para carregar o lançamento.')).toBeOnTheScreen();
      expect(screen.queryByText('Este lançamento foi excluído.')).not.toBeOnTheScreen();
    });

    it('Should say nothing while the entry loads', async () => {
      jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'fridge' });
      mockRealtime({ service: entryQueryService, status: 'loading' }, family, threeTags);
      await render(<EntryDetailsPage />);

      expect(screen.queryByText('Este lançamento foi excluído.')).not.toBeOnTheScreen();
      expect(screen.queryByText('Não deu para carregar o lançamento.')).not.toBeOnTheScreen();
    });
  });

  it('Should close the sheet when the scrim is pressed', async () => {
    const { user } = await renderDetails(payment, pdfReceipt, family, threeTags);

    await user.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
