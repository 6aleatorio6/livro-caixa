import { use, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AboveNavigationBarContext } from './AboveNavigationBarContext';

export interface IScreenProps {
  children: ReactNode;
}

/**
 * A raiz de cada tela: o fundo do tema e o recuo das barras do sistema, que no Android ficam por
 * cima do app (edge-to-edge). Nas abas, o recuo de baixo fica com a barra de navegação.
 */
export function Screen({ children }: IScreenProps) {
  const isAboveNavigationBar = use(AboveNavigationBarContext);
  return <View style={styles.screen(isAboveNavigationBar)}>{children}</View>;
}

const styles = StyleSheet.create((theme, rt) => ({
  screen: (isAboveNavigationBar: boolean) => ({
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingTop: rt.insets.top,
    paddingBottom: isAboveNavigationBar ? 0 : rt.insets.bottom,
    paddingLeft: rt.insets.left,
    paddingRight: rt.insets.right,
  }),
}));
