import type { ComponentProps } from 'react';
import { act, render, screen, within } from '@testing-library/react-native';
import Pdf from 'react-native-pdf';

import { markScopedThemes } from '@/shared/testing/markScopedThemes';

import { PdfPages } from './PdfPages';

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
    await render(<PdfPages uri="https://example.com/a.pdf" fileId="f1" onError={jest.fn()} />);

    await act(async () => pdfProps().onLoadComplete(2));

    expect(within(screen.getByTestId('scoped-theme-dark')).getByText('1 de 2')).toBeOnTheScreen();
  });
});
