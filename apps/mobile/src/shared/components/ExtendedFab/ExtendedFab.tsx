import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';

export interface IExtendedFabProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

/** O botão flutuante estendido, com ícone e rótulo, para a ação principal da lista ("Nova tag"). */
export function ExtendedFab({ icon: Icon, label, onPress }: IExtendedFabProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => styles.container(pressed)}
    >
      <Icon size={24} color={theme.colors.onPrimaryContainer} />
      <AppText variant="labelLarge" color="onPrimaryContainer">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: (isPressed: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smallIncreased,
    height: 56, // a altura do design, sem token
    paddingHorizontal: theme.spacing.largeIncreased,
    borderRadius: theme.radii.large,
    backgroundColor: theme.colors.primaryContainer,
    opacity: isPressed ? theme.opacity.pressed : 1,
    // A sombra do design (y 4, desfoque 10, preto a 18%), sem token; no Android quem a desenha é a elevação.
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  }),
}));
