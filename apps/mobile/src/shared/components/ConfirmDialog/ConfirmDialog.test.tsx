import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { ConfirmDialog } from './ConfirmDialog';

async function renderDialog(overrides: { visible?: boolean } = {}) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  await render(
    <ConfirmDialog
      visible
      title="Excluir a tag Saúde?"
      message="Ela deixa de existir."
      confirmLabel="Excluir"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('Should call only onConfirm when the confirm button is pressed', async () => {
    const { onConfirm, onCancel } = await renderDialog();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Excluir' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('Should call only onCancel when Cancelar is pressed', async () => {
    const { onConfirm, onCancel } = await renderDialog();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Should cancel when the Android back button is pressed', async () => {
    const { onConfirm, onCancel } = await renderDialog();

    // O botão voltar do Android chega como o `onRequestClose` do Modal.
    fireEvent(screen.getByTestId('confirm-dialog'), 'requestClose');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Should show nothing while it is not visible', async () => {
    await renderDialog({ visible: false });

    expect(screen.queryByText('Excluir a tag Saúde?')).toBeNull();
  });
});
