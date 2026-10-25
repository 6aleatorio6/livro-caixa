import { render, screen, userEvent } from '@testing-library/react-native';

import { ReceiptSummary, type IReceiptSummaryProps } from './ReceiptSummary';

const pdf = { name: 'comprovante-luz.pdf', type: 'pdf', sizeBytes: 182 * 1024 } as const;
const image = { name: 'recibo-conserto.jpg', type: 'image', sizeBytes: Math.round(1.2 * 1024 * 1024) } as const;

async function renderSummary(overrides: Partial<IReceiptSummaryProps> = {}) {
  const onPress = jest.fn();
  await render(<ReceiptSummary file={pdf} action={{ label: 'Ver', onPress }} {...overrides} />);
  return { onPress, user: userEvent.setup() };
}

describe('ReceiptSummary', () => {
  it('Should show the type, the size, the name and the action of a PDF', async () => {
    await renderSummary();

    expect(screen.getByText('PDF · 182 KB')).toBeOnTheScreen();
    expect(screen.getByText('comprovante-luz.pdf')).toBeOnTheScreen();
    expect(screen.getByText('Ver')).toBeOnTheScreen();
  });

  it('Should show the type and the size of an image', async () => {
    await renderSummary({ file: image });

    expect(screen.getByText('Imagem · 1,2 MB')).toBeOnTheScreen();
    expect(screen.getByText('recibo-conserto.jpg')).toBeOnTheScreen();
  });

  it('Should call onPress when the action is pressed', async () => {
    const { onPress, user } = await renderSummary();

    await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-luz.pdf. Ver' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should not call onPress while disabled', async () => {
    const { onPress, user } = await renderSummary({ file: null, disabled: true });

    await user.press(screen.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });

  describe('When the file came from the Android share', () => {
    it('Should say where it came from, and be read-only without an action', async () => {
      await render(<ReceiptSummary file={pdf} isShared />);

      expect(screen.getByText('Veio do compartilhamento · PDF · 182 KB')).toBeOnTheScreen();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('Should show the reason of a refusal instead of the origin', async () => {
      await render(
        <ReceiptSummary
          file={null}
          errorMessage="O PDF passa de 5 MB."
          rejectedFileName="Compartilhe outro arquivo."
          isShared
        />,
      );

      expect(screen.getByText('O PDF passa de 5 MB.')).toBeOnTheScreen();
      expect(screen.queryByText(/Veio do compartilhamento/)).toBeNull();
    });
  });
});
