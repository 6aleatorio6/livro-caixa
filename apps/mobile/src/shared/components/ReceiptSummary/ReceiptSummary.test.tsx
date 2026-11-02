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

  describe('When the row opens the file', () => {
    it('Should open the file from the row and leave the action to its own target', async () => {
      const onOpen = jest.fn();
      const { onPress, user } = await renderSummary({ action: { label: 'Trocar', onPress: jest.fn() }, onOpen });

      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-luz.pdf. Ver' }));

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('Should run the action, not open the file, when the action is pressed', async () => {
      const onOpen = jest.fn();
      const onChange = jest.fn();
      const user = userEvent.setup();
      await render(<ReceiptSummary file={pdf} action={{ label: 'Trocar', onPress: onChange }} onOpen={onOpen} />);

      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-luz.pdf. Trocar' }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('Should neither open the file nor run the action while disabled', async () => {
      const onOpen = jest.fn();
      const onChange = jest.fn();
      const user = userEvent.setup();
      await render(
        <ReceiptSummary file={pdf} action={{ label: 'Trocar', onPress: onChange }} onOpen={onOpen} disabled />,
      );

      await user.press(screen.getByRole('button', { name: /Ver$/ }));
      await user.press(screen.getByRole('button', { name: /Trocar$/ }));

      expect(onOpen).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should open the file from the whole row when there is no action', async () => {
      const onOpen = jest.fn();
      const user = userEvent.setup();
      await render(<ReceiptSummary file={pdf} onOpen={onOpen} isShared />);

      await user.press(screen.getByRole('button', { name: 'Comprovante: comprovante-luz.pdf. Ver' }));

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Ver')).toBeNull();
    });
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
          errorMessage="O PDF passa de 900 KB. Escolha outro arquivo."
          rejectedFileName="Compartilhe outro arquivo."
          isShared
        />,
      );

      expect(screen.getByText('O PDF passa de 900 KB. Escolha outro arquivo.')).toBeOnTheScreen();
      expect(screen.queryByText(/Veio do compartilhamento/)).toBeNull();
    });
  });
});
