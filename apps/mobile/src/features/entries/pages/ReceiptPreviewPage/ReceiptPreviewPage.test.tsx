import { act, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { ZoomableImage } from '@/features/entries/components/ZoomableImage/ZoomableImage';

import { ReceiptPreviewPage } from './ReceiptPreviewPage';

jest.mock('expo-router', () => ({ router: { back: jest.fn() }, useLocalSearchParams: jest.fn() }));
// O zoom é dos gestos nativos e se confere no aparelho; o teste lê as props que a tela passa.
jest.mock('@/features/entries/components/ZoomableImage/ZoomableImage', () => ({ ZoomableImage: jest.fn(() => null) }));

const imageProps = () => jest.mocked(ZoomableImage).mock.calls.at(-1)![0];

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({ uri: 'file:///cache/pix-agua-outubro.png', name: 'pix-agua-outubro.pdf' });
});

describe('ReceiptPreviewPage', () => {
  it('Should open the file from the phone, with its name in the title', async () => {
    await render(<ReceiptPreviewPage />);

    expect(imageProps().uri).toBe('file:///cache/pix-agua-outubro.png');
    expect(screen.getByText('pix-agua-outubro.pdf')).toBeOnTheScreen();
  });

  it('Should say it could not open the file, without Tentar de novo, when the image does not load', async () => {
    await render(<ReceiptPreviewPage />);

    await act(async () => imageProps().onError());

    expect(screen.getByText('Não deu para abrir o comprovante.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
  });
});
