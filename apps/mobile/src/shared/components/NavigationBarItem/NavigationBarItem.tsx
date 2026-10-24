import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { TabTriggerSlotProps } from 'expo-router/ui';

import { AppText } from '@/shared/components/AppText/AppText';

export interface INavigationBarItemProps extends Omit<TabTriggerSlotProps, 'ref'> {
  icon: LucideIcon;
  label: string;
}

/**
 * Um item da barra de navegação, filho de um `TabTrigger asChild`: a pílula marca a aba ativa. O
 * `href` do `TabTrigger` fica de fora, porque o `Pressable` não o aceita.
 */
export function NavigationBarItem({
  icon: Icon,
  label,
  isFocused = false,
  href: _href,
  ...props
}: INavigationBarItemProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => styles.item(pressed)}
    >
      {/* Sem `collapsable={false}`, o Fabric achata a pílula transparente da aba inativa, e ela volta sem o raio. */}
      <View collapsable={false} style={styles.indicator(isFocused)}>
        <Icon size={24} color={isFocused ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant} />
      </View>
      <AppText
        variant={isFocused ? 'labelMediumEmphasized' : 'labelMedium'}
        color={isFocused ? 'onSurface' : 'onSurfaceVariant'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  item: (isPressed: boolean) => ({
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.extraSmall,
    opacity: isPressed ? 0.88 : 1,
  }),
  indicator: (isFocused: boolean) => ({
    width: 64,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.large,
    backgroundColor: isFocused ? theme.colors.secondaryContainer : 'transparent',
  }),
}));
