import { render, screen, userEvent } from '@testing-library/react-native';

import { DeleteWithConfirm } from './DeleteWithConfirm';

async function renderDelete(overrides: { disabled?: boolean; disabledReason?: string } = {}) {
  const onConfirm = jest.fn();
  await render(
    <DeleteWithConfirm
      label="Excluir tag"
      dialogTitle="Excluir a tag Casa?"
      dialogMessage="Ela sai da lista."
      onConfirm={onConfirm}
      {...overrides}
    />,
  );
  return { onConfirm };
}

describe('DeleteWithConfirm', () => {
  it('Should ask for the confirmation first and delete only when confirmed', async () => {
    const { onConfirm } = await renderDelete();
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Excluir tag' }));
    expect(onConfirm).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Excluir' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Excluir a tag Casa?')).not.toBeOnTheScreen();
  });

  it('Should not delete when the confirmation is cancelled', async () => {
    const { onConfirm } = await renderDelete();
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Excluir tag' }));
    await user.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByText('Excluir a tag Casa?')).not.toBeOnTheScreen();
  });

  it('Should keep the button off and say why when it is disabled', async () => {
    await renderDelete({ disabled: true, disabledReason: 'Está em uso.' });

    expect(screen.getByRole('button', { name: 'Excluir tag' })).toBeDisabled();
    expect(screen.getByText('Está em uso.')).toBeOnTheScreen();
  });
});
