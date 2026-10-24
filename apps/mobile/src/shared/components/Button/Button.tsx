import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import type { IButtonVariant } from '@/shared/types/components/ButtonVariant';

export interface IButtonProps {
  label: string;
  onPress: () => void;
  variant?: IButtonVariant;
  icon?: LucideIcon;
  isLoading?: boolean;
  disabled?: boolean;
}

const CONTAINER_COLOR_BY_VARIANT: Record<IButtonVariant, IColorRole | null> = {
  filled: 'primary',
  tonal: 'secondaryContainer',
  outlined: null,
  text: null,
};

const CONTENT_COLOR_BY_VARIANT: Record<IButtonVariant, IColorRole> = {
  filled: 'onPrimary',
  tonal: 'onSecondaryContainer',
  outlined: 'primary',
  text: 'primary',
};

/** Botão com texto. Carregando, ele não aceita toque e avisa o leitor de tela que está ocupado. */
export function Button({
  label,
  onPress,
  variant = 'filled',
  icon: Icon,
  isLoading = false,
  disabled = false,
}: IButtonProps) {
  const { theme } = useUnistyles();
  const contentColor = CONTENT_COLOR_BY_VARIANT[variant];
  const isInactive = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: isLoading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => styles.container(variant, pressed, isInactive)}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors[contentColor]} />
        ) : (
          Icon && <Icon size={18} color={theme.colors[contentColor]} />
        )}
        <AppText variant="labelLarge" color={contentColor}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: (variant: IButtonVariant, isPressed: boolean, isInactive: boolean) => {
    const containerColor = CONTAINER_COLOR_BY_VARIANT[variant];
    return {
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: variant === 'text' ? theme.spacing.medium : theme.spacing.largeIncreased,
      borderRadius: theme.radii.full,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: theme.colors.outline,
      backgroundColor: containerColor ? theme.colors[containerColor] : 'transparent',
      opacity: isInactive ? 0.38 : isPressed ? 0.88 : 1,
    };
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.small,
  },
}));
