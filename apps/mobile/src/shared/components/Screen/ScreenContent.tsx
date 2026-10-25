import type { ReactNode } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { spacing } from '@/core/theme/spacing';

export interface IScreenContentProps {
  /** O vão entre os blocos da tela, pelo nome do espaçamento do tema; sem ele os blocos ficam colados. */
  gap?: keyof typeof spacing;
  children: ReactNode;
}

/**
 * O corpo rolável de uma tela, sob a barra de cima: os recuos das laterais e o vão entre os blocos. O campo com foco
 * rola para cima do teclado, com um vão entre o cursor e o teclado.
 */
export function ScreenContent({ gap = 'none', children }: IScreenContentProps) {
  const { theme } = useUnistyles();

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content(gap)}
      bottomOffset={theme.spacing.extraExtraExtraLarge}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: (gap: keyof typeof spacing) => ({
    gap: theme.spacing[gap],
    paddingTop: theme.spacing.small,
    paddingHorizontal: theme.spacing.largeIncreased,
    paddingBottom: theme.spacing.extraLarge,
  }),
}));
