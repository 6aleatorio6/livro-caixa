import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

export interface IIconButtonProps {
  icon: LucideIcon;
  /** O que o botão faz, para o leitor de tela: um ícone sozinho não diz. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** A cor do ícone; o padrão é a dos ícones de ação, e a barra superior usa a do título. */
  color?: IColorRole;
}

export function IconButton({ icon: Icon, label, onPress, disabled = false, color = 'onSurfaceVariant' }: IIconButtonProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => styles.container(pressed, disabled)}
    >
      <Icon size={24} color={theme.colors[color]} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: (isPressed: boolean, isDisabled: boolean) => ({
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: isPressed ? theme.colors.surfaceContainerHighest : 'transparent',
    opacity: isDisabled ? theme.opacity.disabled : 1,
  }),
}));
