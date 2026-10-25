import type { ComponentProps } from 'react';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Pdf from 'react-native-pdf';

import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { allowedEmailListQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService.scenarios';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { entryQueryScenarios } from '@/shared/services/entry/query/entryQueryService.scenarios';
import { getReceiptUrlService } from '@/shared/services/file/getReceiptUrlService';
import {
  getReceiptUrlRejectedScenarios,
  getReceiptUrlScenarios,
} from '@/shared/services/file/getReceiptUrlService.scenarios';
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
jest.mock('@/shared/services/file/getReceiptUrlService', () => ({ getReceiptUrlService: jest.fn() }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: jest.fn() }));
// O zoom é dos gestos nativos e se confere no aparelho; o teste lê as props que a tela passa.
jest.mock('./components/ZoomableImage/ZoomableImage', () => ({ ZoomableImage: jest.fn(() => null) }));

const family = { service: allowedEmailListQueryService, scenario: allowedEmailListQueryScenarios.familyList };
const oneOffBill = { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillOfTheMember };
const payment = { service: entryQueryService, scenario: entryQueryScenarios.paymentOfTheMember };
const imageReceipt = { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.imageReceipt };
const pdfReceipt = { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.pdfReceipt };

const imageAddress = getReceiptUrlScenarios.receiptOfAnotherMember;
const pdfAddress = getReceiptUrlScenarios.pdfReceiptOfTheMember;

const imageProps = () => jest.mocked(ZoomableImage).mock.calls.at(-1)![0];
// Os callbacks que o teste dispara, com a assinatura que o `Pdf` os chama no aparelho.
interface IPdfCallbacks {
  onLoadComplete: (pages: number) => void;
  onPageChanged: (page: number, pages: number) => void;
  onError: () => void;
}
const pdfProps = () =>
  jest.mocked(Pdf).mock.calls.at(-1)![0] as Omit<ComponentProps<typeof Pdf>, keyof IPdfCallbacks> & IPdfCallbacks;

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
      mockServiceScenario(getReceiptUrlService, imageAddress);

      await renderViewer(oneOffBill, imageReceipt, family);

      expect(getReceiptUrlService).toHaveBeenCalledWith(...imageAddress.input);
      expect(imageProps().uri).toBe(imageAddress.result);
      expect(screen.getByText('recibo-conserto.jpg')).toBeOnTheScreen();
      expect(screen.getByText('Conserto da geladeira · R$ 350,00')).toBeOnTheScreen();
      expect(screen.getByText('Conta avulsa de 12/10/2026 · registrada por Bruno')).toBeOnTheScreen();
    });

    it('Should say it could not open the image and ask for the address again on Tentar de novo', async () => {
      mockServiceScenario(getReceiptUrlService, imageAddress);
      const user = await renderViewer(oneOffBill, imageReceipt, family);

      await act(async () => imageProps().onError());
      expect(screen.getByText('Não deu para abrir o comprovante.')).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

      expect(getReceiptUrlService).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Não deu para abrir o comprovante.')).not.toBeOnTheScreen();
      expect(imageProps().uri).toBe(imageAddress.result);
    });
  });

  describe('The PDF', () => {
    it('Should open the PDF inside the app, name its cached file after the record and show the page indicator once it has two pages', async () => {
      mockServiceScenario(getReceiptUrlService, pdfAddress);
      await renderViewer(payment, pdfReceipt, family);

      expect(getReceiptUrlService).toHaveBeenCalledWith(...pdfAddress.input);
      expect(pdfProps().source).toEqual({ uri: pdfAddress.result, cache: true, cacheFileName: pdfReceipt.scenario.result.id });
      expect(screen.getByText('comprovante-luz.pdf')).toBeOnTheScreen();
      expect(screen.queryByText(/ de 2$/)).not.toBeOnTheScreen();

      await act(async () => pdfProps().onLoadComplete(2));
      expect(screen.getByText('1 de 2')).toBeOnTheScreen();

      await act(async () => pdfProps().onPageChanged(2, 2));
      expect(screen.getByText('2 de 2')).toBeOnTheScreen();
    });

    // A `react-native-pdf` baixa o arquivo com `trustAllCerts` ligado por padrão: no aparelho a `react-native-blob-util` falha
    // ("Use of own trust manager but none defined"), e o padrão aceitaria qualquer certificado.
    it('Should download the PDF checking the certificates', async () => {
      mockServiceScenario(getReceiptUrlService, pdfAddress);

      await renderViewer(payment, pdfReceipt, family);

      expect(pdfProps().trustAllCerts).toBe(false);
    });

    it('Should show the payment below the PDF: the bill, the amount, the month, who registered it and when', async () => {
      mockServiceScenario(getReceiptUrlService, pdfAddress);

      await renderViewer(payment, pdfReceipt, family);

      expect(screen.getByText('Luz · R$ 187,35')).toBeOnTheScreen();
      expect(screen.getByText('Pagamento de outubro de 2026 · registrado por Bruno em 10/10/2026')).toBeOnTheScreen();
    });

    it('Should hide the page indicator for a PDF with a single page', async () => {
      mockServiceScenario(getReceiptUrlService, pdfAddress);
      await renderViewer(payment, pdfReceipt, family);

      await act(async () => pdfProps().onLoadComplete(1));

      expect(screen.queryByText('1 de 1')).not.toBeOnTheScreen();
    });

    it('Should say it could not open a PDF that fails to load', async () => {
      mockServiceScenario(getReceiptUrlService, pdfAddress);
      await renderViewer(payment, pdfReceipt, family);

      await act(async () => pdfProps().onError());

      expect(screen.getByText('Não deu para abrir o comprovante.')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeOnTheScreen();
    });
  });

  describe('When there is nothing to show', () => {
    it('Should say the receipt was not found, without Tentar de novo, when the object is missing', async () => {
      mockServiceRejection(getReceiptUrlService, getReceiptUrlRejectedScenarios.receiptObjectMissing);

      await renderViewer(oneOffBill, imageReceipt, family);

      expect(await screen.findByText('O comprovante não foi encontrado.')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
    });

    it('Should say the receipt was not found, and ask for no address, when its record is missing', async () => {
      await renderViewer(
        { service: entryQueryService, scenario: entryQueryScenarios.oneOffBillWithoutTag },
        { service: receiptFileQueryService, scenario: receiptFileQueryScenarios.missingReceiptFile },
        family,
      );

      expect(screen.getByText('O comprovante não foi encontrado.')).toBeOnTheScreen();
      expect(getReceiptUrlService).not.toHaveBeenCalled();
    });

    it('Should say the entry was deleted for an id that does not exist', async () => {
      await renderViewer(
        { service: entryQueryService, scenario: entryQueryScenarios.missingEntry },
        { service: receiptFileQueryService, status: 'idle' },
        family,
      );

      expect(screen.getByText('Este lançamento foi excluído.')).toBeOnTheScreen();
      expect(getReceiptUrlService).not.toHaveBeenCalled();
    });

    it('Should show nothing of the file while the address is not back', async () => {
      jest.mocked(getReceiptUrlService).mockReturnValue(new Promise(() => {}));

      await renderViewer(oneOffBill, imageReceipt, family);

      expect(ZoomableImage).not.toHaveBeenCalled();
      expect(screen.queryByText('Não deu para abrir o comprovante.')).not.toBeOnTheScreen();
      expect(screen.getByText('Conserto da geladeira · R$ 350,00')).toBeOnTheScreen();
    });
  });

  it('Should close with the x', async () => {
    mockServiceScenario(getReceiptUrlService, imageAddress);
    const user = await renderViewer(oneOffBill, imageReceipt, family);

    await user.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
