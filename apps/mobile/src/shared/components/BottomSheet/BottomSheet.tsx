import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface IBottomSheetProps {
  /** Chamado pelo toque no véu. O botão voltar do Android é do navegador da rota que mostra a folha. */
  onClose: () => void;
  children: ReactNode;
}

/**
 * A folha encostada embaixo, com a alça e o véu do tema. Não é um `Modal`: preenche o pai, que é uma rota
 * apresentada como modal transparente. O conteúdo rola quando passa da altura da tela menos a barra de status.
 */
export function BottomSheet({ onClose, children }: IBottomSheetProps) {
  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={styles.scrim} />
      <View style={styles.panel}>
        <Decorative style={styles.handle}>
          <View style={styles.bar} />
        </Decorative>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} bounces={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.scrim, opacity: theme.opacity.scrim },
  panel: {
    maxHeight: rt.screen.height - rt.insets.top,
    gap: theme.spacing.large,
    paddingHorizontal: theme.spacing.largeIncreased,
    paddingBottom: theme.spacing.extraLargeIncreased,
    borderTopLeftRadius: theme.radii.extraLarge,
    borderTopRightRadius: theme.radii.extraLarge,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  handle: { height: 24, alignItems: 'center', justifyContent: 'center' }, // a alça do design, sem token
  bar: { width: 32, height: 4, borderRadius: 2, backgroundColor: theme.colors.onSurfaceVariant, opacity: 0.4 },
  scroll: { flexShrink: 1 },
  content: { gap: theme.spacing.large },
}));
