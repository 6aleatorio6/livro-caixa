import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { entryQueryScenarios } from '@/shared/services/entry/query/entryQueryService.scenarios';
import { getReceiptContentService } from '@/shared/services/file/getReceiptContentService';
import {
  getReceiptContentRejectedScenarios,
  getReceiptContentScenarios,
} from '@/shared/services/file/getReceiptContentService.scenarios';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { receiptFileQueryScenarios } from '@/shared/services/file/query/receiptFileQueryService.scenarios';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import { mockServiceRejection } from '@/shared/testing/mockServiceRejection';
import { mockServiceScenario } from '@/shared/testing/mockServiceScenario';
import type { IRealtimeMock } from '@/shared/types/testing/RealtimeMock';

import { ZoomableImage } from './components/ZoomableImage/ZoomableImage';
import { ReceiptViewerPage } from './ReceiptViewerPage';

// Mocks com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/entry/query/entryQueryService', () => ({ entryQueryService: {} }));
jest.mock('@/shared/services/file/query/receiptFileQueryService', () => ({ receiptFileQueryService: {} }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailListQueryService', () => ({
  allowedEmailListQueryService: {},
}));
jest.mock('@/shared/services/file/getReceiptContentService', () => ({ getReceiptContentService: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: jest.fn() }));
// O zoom é dos gestos nativos e se confere no aparelho; o teste lê as props que a tela passa.
jest.mock('./components/ZoomableImage/ZoomableImage', () => ({ ZoomableImage: jest.fn(() => null) }));

const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const oneOffBill = { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillOfTheMember };
const payment = { service: entryQueryService, scenario: entryQueryScenarios.paymentOfTheMember };
const imageReceipt = { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.imageReceipt };
const convertedPdfReceipt = {
  service: receiptFileQueryService,
  scenario: receiptFileQueryScenarios.convertedPdfReceipt,
};

const imageContent = getReceiptContentScenarios.receiptOfAnotherMember;

const imageProps = () => jest.mocked(ZoomableImage).mock.calls.at(-1)![0];

// O mock do lançamento lido pelo id: o `id` do cenário é o da rota.
type IEntryMock = IRealtimeMock & { scenario: { input: { id: string } } };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ReceiptViewerPage', () => {
  async function renderViewer(entry: IEntryMock, ...others: Parameters<typeof mockRealtime>) {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: entry.scenario.input.id });
    mockRealtime(entry, ...others);
    await render(<ReceiptViewerPage />);
    return userEvent.setup();
  }

  describe('The image', () => {
    it('Should open the image of the receipt, with the file name in the title and the entry below', async () => {
      mockServiceScenario(getReceiptContentService, imageContent);

      await renderViewer(oneOffBill, imageReceipt, family);

      expect(getReceiptContentService).toHaveBeenCalledWith(imageReceipt.scenario.result.id, 'image/jpeg');
      expect(imageProps().uri).toBe(imageContent.result);
      expect(screen.getByText('recibo-conserto.jpg')).toBeOnTheScreen();
      expect(screen.getByText('Conserto da geladeira · R$ 350,00')).toBeOnTheScreen();
      expect(screen.getByText('Conta avulsa de 12/10/2026 · registrada por Bruno')).toBeOnTheScreen();
    });

    it('Should say it could not open the image and ask for the content again on Tentar de novo', async () => {
      mockServiceScenario(getReceiptContentService, imageContent);
      const user = await renderViewer(oneOffBill, imageReceipt, family);

      await act(async () => imageProps().onError());
      expect(screen.getByText('Não deu para abrir o comprovante.')).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

      expect(getReceiptContentService).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Não deu para abrir o comprovante.')).not.toBeOnTheScreen();
      expect(imageProps().uri).toBe(imageContent.result);
    });
  });

  describe('The PDF', () => {
    it('Should open a PDF as the image of its page, with the name chosen in the title', async () => {
      mockServiceScenario(getReceiptContentService, imageContent);

      await renderViewer(payment, convertedPdfReceipt, family);

      expect(getReceiptContentService).toHaveBeenCalledWith(convertedPdfReceipt.scenario.result.id, 'image/png');
      expect(imageProps().uri).toBe(imageContent.result);
      expect(screen.getByText('comprovante-luz.pdf')).toBeOnTheScreen();
    });

    it('Should show the payment below the image: the bill, the amount, the month, who registered it and when', async () => {
      mockServiceScenario(getReceiptContentService, imageContent);

      await renderViewer(payment, convertedPdfReceipt, family);

      expect(screen.getByText('Luz · R$ 187,35')).toBeOnTheScreen();
      expect(screen.getByText('Pagamento de outubro de 2026 · registrado por Bruno em 10/10/2026')).toBeOnTheScreen();
    });
  });

  describe('When there is nothing to show', () => {
    it('Should say the receipt was not found, without Tentar de novo, when the content is missing', async () => {
      mockServiceRejection(getReceiptContentService, getReceiptContentRejectedScenarios.receiptContentMissing);

      await renderViewer(oneOffBill, imageReceipt, family);

      expect(await screen.findByText('O comprovante não foi encontrado.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
    });

    it('Should say the receipt was not found, and ask for no content, when its record is missing', async () => {
      await renderViewer(
        { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillWithoutTag },
        { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.missingReceiptFile },
        family,
      );

      expect(screen.getByText('O comprovante não foi encontrado.')).toBeOnTheScreen();
      expect(getReceiptContentService).not.toHaveBeenCalled();
    });

    it('Should say the entry was deleted for an id that does not exist', async () => {
      await renderViewer(
        { service: entryQueryService, scenario: entryQueryScenarios.missingEntry },
        { service: receiptFileQueryService, status: 'idle' },
        family,
      );

      expect(screen.getByText('Este lançamento foi excluído.')).toBeOnTheScreen();
      expect(getReceiptContentService).not.toHaveBeenCalled();
    });

    it('Should show nothing of the file while the content is not back', async () => {
      jest.mocked(getReceiptContentService).mockReturnValue(new Promise(() => {}));

      await renderViewer(oneOffBill, imageReceipt, family);

      expect(ZoomableImage).not.toHaveBeenCalled();
      expect(screen.queryByText('Não deu para abrir o comprovante.')).not.toBeOnTheScreen();
      expect(screen.getByText('Conserto da geladeira · R$ 350,00')).toBeOnTheScreen();
    });
  });

  it('Should close with the x', async () => {
    mockServiceScenario(getReceiptContentService, imageContent);
    const user = await renderViewer(oneOffBill, imageReceipt, family);

    await user.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
