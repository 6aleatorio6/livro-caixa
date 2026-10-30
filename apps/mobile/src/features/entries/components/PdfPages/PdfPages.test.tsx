import type { ComponentProps } from 'react';
import { act, render, screen, within } from '@testing-library/react-native';
import Pdf from 'react-native-pdf';

import { markScopedThemes } from '@/shared/testing/markScopedThemes';

import { PdfPages } from './PdfPages';

const PDF_URI = 'data:application/pdf;base64,JVBERi0xLjQ=';

// O callback que o teste dispara, com a assinatura que o `Pdf` o chama no aparelho.
const pdfProps = () =>
  jest.mocked(Pdf).mock.calls.at(-1)![0] as Omit<ComponentProps<typeof Pdf>, 'onLoadComplete'> & {
    onLoadComplete: (pages: number) => void;
  };

beforeEach(() => {
  jest.clearAllMocks();
  markScopedThemes();
});

describe('PdfPages', () => {
  // O indicador aparece depois do `onLoadComplete`, com a peça já montada. O Unistyles aplica o escopo de tema de um
  // `ScopedTheme` só a quem monta junto com ele: sem o seu próprio `ScopedTheme`, o indicador saía com as cores do tema
  // claro dentro do visualizador escuro. O Jest não vê a cor (o mock usa o tema claro sempre), então o teste confere o escopo.
  it('Should draw the page indicator inside its own dark scope, since it mounts after the viewer', async () => {
    await render(<PdfPages uri={PDF_URI} cacheFileName="f1" onError={jest.fn()} />);

    await act(async () => pdfProps().onLoadComplete(2));

    expect(within(screen.getByTestId('scoped-theme-dark')).getByText('1 de 2')).toBeOnTheScreen();
  });

  it('Should not show the page indicator for a PDF of one page', async () => {
    await render(<PdfPages uri={PDF_URI} cacheFileName="f1" onError={jest.fn()} />);

    await act(async () => pdfProps().onLoadComplete(1));

    expect(screen.queryByText('1 de 1')).not.toBeOnTheScreen();
  });

  // Com o `cache` da biblioteca, um arquivo que não abriu (cortado ao gravar) seria aberto de novo em toda abertura.
  it('Should write the content under the given name on each open, without reusing the file of an earlier open', async () => {
    await render(<PdfPages uri={PDF_URI} cacheFileName="f1" onError={jest.fn()} />);

    expect(pdfProps().source).toEqual({ uri: PDF_URI, cacheFileName: 'f1' });
  });

  it('Should read a file from the phone where it is, without caching it', async () => {
    await render(<PdfPages uri="file:///cache/pix.pdf" onError={jest.fn()} />);

    expect(pdfProps().source).toEqual({ uri: 'file:///cache/pix.pdf' });
  });

  it('Should hand the file:/ uri with one slash that expo-sharing gives to the library as file:///', async () => {
    await render(<PdfPages uri="file:/data/user/0/dev.leonardolf.livrocaixa/cache/pix.pdf" onError={jest.fn()} />);

    expect(pdfProps().source).toEqual({ uri: 'file:///data/user/0/dev.leonardolf.livrocaixa/cache/pix.pdf' });
  });

  it('Should show a loader until the PDF loads', async () => {
    await render(<PdfPages uri={PDF_URI} cacheFileName="f1" onError={jest.fn()} />);
    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();

    await act(async () => pdfProps().onLoadComplete(1));

    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
  });

  it('Should label the area Comprovante once the PDF loads', async () => {
    await render(<PdfPages uri={PDF_URI} cacheFileName="f1" onError={jest.fn()} />);
    expect(screen.queryByLabelText('Comprovante')).not.toBeOnTheScreen();

    await act(async () => pdfProps().onLoadComplete(1));

    expect(screen.getByLabelText('Comprovante')).toBeOnTheScreen();
  });
});
