import type { LucideIcon, LucideProps } from 'lucide-react-native';
import { View } from 'react-native';
import { render, screen, userEvent } from '@testing-library/react-native';

import { lightTheme } from '@/core/theme/lightTheme';
import { IconButton } from '@/shared/components/IconButton/IconButton';

// Um ícone que mostra a cor recebida, para o teste lê-la.
function StubIcon({ color }: LucideProps) {
  return <View testID="icon" accessibilityLabel={String(color)} />;
}

async function renderIconButton(overrides: { disabled?: boolean; color?: 'onSurface' } = {}) {
  const onPress = jest.fn();
  await render(<IconButton icon={StubIcon as unknown as LucideIcon} label="Alterar nome" onPress={onPress} {...overrides} />);
  return { onPress };
}

describe('IconButton', () => {
  it('Should call onPress when pressed', async () => {
    const { onPress } = await renderIconButton();

    await userEvent.setup().press(screen.getByRole('button', { name: 'Alterar nome' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should use the color prop on the icon', async () => {
    await renderIconButton({ color: 'onSurface' });

    expect(screen.getByTestId('icon')).toHaveProp('accessibilityLabel', lightTheme.colors.onSurface);
  });

  describe('When disabled', () => {
    it('Should state it as disabled to accessibility', async () => {
      await renderIconButton({ disabled: true });

      expect(screen.getByRole('button', { name: 'Alterar nome' })).toBeDisabled();
    });

    it('Should draw the icon in outlineVariant', async () => {
      await renderIconButton({ disabled: true, color: 'onSurface' });

      expect(screen.getByTestId('icon')).toHaveProp('accessibilityLabel', lightTheme.colors.outlineVariant);
    });

    it('Should not call onPress', async () => {
      const { onPress } = await renderIconButton({ disabled: true });

      await userEvent.setup().press(screen.getByRole('button', { name: 'Alterar nome' }));

      expect(onPress).not.toHaveBeenCalled();
    });
  });
});
