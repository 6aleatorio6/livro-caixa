import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';

export interface IBadgeProps {
  label: string;
  /** A cor do fundo do selo. */
  background: IColorRole;
  /** A cor do texto, que combina com a do fundo. */
  color: IColorRole;
}

/** O selo de estado ao lado de um texto: "Este mês" no cabeçalho, "De outubro" ou "Atrasada" numa linha de conta. */
export function Badge({ label, background, color }: IBadgeProps) {
  return (
    <View style={styles.badge(background)}>
      <AppText variant="labelSmall" color={color}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: (background: IColorRole) => ({
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.extraExtraSmall,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[background],
  }),
}));
