import { render, screen, userEvent } from '@testing-library/react-native';

import { ConfirmButton } from './ConfirmButton';

async function renderButton(overrides: { isLoading?: boolean; disabled?: boolean } = {}) {
  const onConfirm = jest.fn();
  await render(
    <ConfirmButton
      label="Pular outubro"
      variant="text"
      title="Pular a Internet de outubro?"
      message="Ela sai das contas a pagar."
      confirmLabel="Pular"
      confirmVariant="text"
      onConfirm={onConfirm}
      {...overrides}
    />,
  );
  return { onConfirm };
}

describe('ConfirmButton', () => {
  it('Should open the dialog first and call onConfirm only when confirmed, closing the dialog', async () => {
    const { onConfirm } = await renderButton();
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Pular outubro' }));

    expect(screen.getByText('Pular a Internet de outubro?')).toBeOnTheScreen();
    expect(screen.getByText('Ela sai das contas a pagar.')).toBeOnTheScreen();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Pular' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Pular a Internet de outubro?')).not.toBeOnTheScreen();
  });

  it('Should not call onConfirm when the dialog is cancelled', async () => {
    const { onConfirm } = await renderButton();
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Pular outubro' }));
    await user.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByText('Pular a Internet de outubro?')).not.toBeOnTheScreen();
  });

  it('Should not open the dialog while the confirmed request is running', async () => {
    await renderButton({ isLoading: true });

    await userEvent.setup().press(screen.getByRole('button', { name: 'Pular outubro' }));

    expect(screen.getByRole('button', { name: 'Pular outubro' })).toBeBusy();
    expect(screen.queryByText('Pular a Internet de outubro?')).not.toBeOnTheScreen();
  });

  it('Should not open the dialog while it is disabled', async () => {
    await renderButton({ disabled: true });

    await userEvent.setup().press(screen.getByRole('button', { name: 'Pular outubro' }));

    expect(screen.getByRole('button', { name: 'Pular outubro' })).toBeDisabled();
    expect(screen.queryByText('Pular a Internet de outubro?')).not.toBeOnTheScreen();
  });
});
