import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from './Button';

async function renderButton(overrides: { disabled?: boolean; isLoading?: boolean } = {}) {
  const onPress = jest.fn();
  await render(<Button label="Entrar com Google" onPress={onPress} {...overrides} />);
  return { onPress };
}

describe('Button', () => {
  it('Should call onPress when pressed', async () => {
    const { onPress } = await renderButton();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Entrar com Google' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should not call onPress while disabled', async () => {
    const { onPress } = await renderButton({ disabled: true });

    await userEvent.setup().press(screen.getByRole('button', { name: 'Entrar com Google' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('Should not call onPress while loading, and tell the screen reader it is busy', async () => {
    const { onPress } = await renderButton({ isLoading: true });
    const button = screen.getByRole('button', { name: 'Entrar com Google' });

    await userEvent.setup().press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
  });
});
