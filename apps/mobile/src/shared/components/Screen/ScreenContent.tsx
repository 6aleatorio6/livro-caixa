import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { spacing } from '@/core/theme/spacing';

export interface IScreenContentProps {
  /** O vão entre os blocos da tela, pelo nome do espaçamento do tema; sem ele os blocos ficam colados. */
  gap?: keyof typeof spacing;
  children: ReactNode;
}

/** O corpo rolável de uma tela, sob a barra de cima: os recuos das laterais e o vão entre os blocos. */
export function ScreenContent({ gap = 'none', children }: IScreenContentProps) {
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content(gap)}>
      {children}
    </ScrollView>
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
