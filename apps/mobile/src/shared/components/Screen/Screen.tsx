import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface IScreenProps {
  children: ReactNode;
}

/**
 * A raiz de cada tela: o fundo do tema e o recuo das barras do sistema, que no Android ficam por
 * cima do app (edge-to-edge).
 */
export function Screen({ children }: IScreenProps) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
    paddingLeft: rt.insets.left,
    paddingRight: rt.insets.right,
  },
}));
