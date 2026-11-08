import type { ReactNode } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { spacing } from '@/core/theme/spacing';
import { EXTENDED_FAB_HEIGHT } from '@/shared/components/ExtendedFab/extendedFabHeight';

export interface IScreenContentProps {
  /** O vão entre os blocos da tela, pelo nome do espaçamento do tema; sem ele os blocos ficam colados. */
  gap?: keyof typeof spacing;
  /** A tela tem o botão flutuante: o fim da lista ganha o espaço dele, para o último item subir acima do botão. */
  hasFloatingButton?: boolean;
  children: ReactNode;
}

/**
 * O corpo rolável de uma tela, sob a barra de cima: os recuos das laterais e o vão entre os blocos. O campo com foco
 * rola para cima do teclado, com um vão entre o cursor e o teclado.
 */
export function ScreenContent({ gap = 'none', hasFloatingButton = false, children }: IScreenContentProps) {
  const { theme } = useUnistyles();

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content(gap, hasFloatingButton)}
      bottomOffset={theme.spacing.extraExtraExtraLarge}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: (gap: keyof typeof spacing, hasFloatingButton: boolean) => ({
    gap: theme.spacing[gap],
    paddingTop: theme.spacing.small,
    paddingHorizontal: theme.spacing.largeIncreased,
    // Com o botão flutuante, o fim da lista sobe acima dele: o respiro de baixo do botão, a altura dele e um vão.
    paddingBottom: hasFloatingButton
      ? theme.spacing.extraLarge + EXTENDED_FAB_HEIGHT + theme.spacing.large
      : theme.spacing.extraLarge,
  }),
}));
