import { act, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { PdfPages } from '@/features/entries/components/PdfPages/PdfPages';
import { ScrollableImage } from '@/features/entries/components/ScrollableImage/ScrollableImage';

import { ReceiptPreviewPage } from './ReceiptPreviewPage';

jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: jest.fn() }));
// A carga e a rolagem da imagem se conferem no aparelho; o teste lê as props que a tela passa.
jest.mock('@/features/entries/components/ScrollableImage/ScrollableImage', () => ({
  ScrollableImage: jest.fn(() => null),
}));
// As páginas são desenhadas pelo módulo nativo da `react-native-pdf`; o teste lê as props que a tela passa.
jest.mock('@/features/entries/components/PdfPages/PdfPages', () => ({ PdfPages: jest.fn(() => null) }));

const imageProps = () => jest.mocked(ScrollableImage).mock.calls.at(-1)![0];
const pdfProps = () => jest.mocked(PdfPages).mock.calls.at(-1)![0];

function openPreview(params: { uri: string; name: string; type: string }) {
  jest.mocked(useLocalSearchParams).mockReturnValue(params);
  return render(<ReceiptPreviewPage />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ReceiptPreviewPage', () => {
  it('Should open the image from the phone, with its name in the title', async () => {
    await openPreview({ uri: 'file:///cache/recibo-conserto.jpg', name: 'recibo-conserto.jpg', type: 'image' });

    expect(imageProps().uri).toBe('file:///cache/recibo-conserto.jpg');
    expect(PdfPages).not.toHaveBeenCalled();
    expect(screen.getByText('recibo-conserto.jpg')).toBeOnTheScreen();
  });

  it('Should open an attached PDF in its pages, read from the phone without the cache', async () => {
    await openPreview({ uri: 'file:///cache/pix-agua-outubro.pdf', name: 'pix-agua-outubro.pdf', type: 'pdf' });

    expect(pdfProps()).toMatchObject({ uri: 'file:///cache/pix-agua-outubro.pdf' });
    expect(pdfProps().cacheFileName).toBeUndefined();
    expect(ScrollableImage).not.toHaveBeenCalled();
    expect(screen.getByText('pix-agua-outubro.pdf')).toBeOnTheScreen();
  });

  it('Should say it could not open the file, without Tentar de novo, when the image does not load', async () => {
    await openPreview({ uri: 'file:///cache/recibo-conserto.jpg', name: 'recibo-conserto.jpg', type: 'image' });

    await act(async () => imageProps().onError());

    expect(screen.getByText('Não deu para abrir o comprovante.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
  });

  it('Should say it could not open the file, without Tentar de novo, when the PDF does not open', async () => {
    await openPreview({ uri: 'file:///cache/pix-agua-outubro.pdf', name: 'pix-agua-outubro.pdf', type: 'pdf' });

    await act(async () => pdfProps().onError());

    expect(screen.getByText('Não deu para abrir o comprovante.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
  });
});
