import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface IColorDotProps {
  color: IColorRole;
  /** A bolinha de 8 em vez de 10: a do detalhe de uma conta no Início. */
  isSmall?: boolean;
}

/** A bolinha de cor do design, ao lado do nome de uma tag: só enfeite, o leitor de tela lê o nome. */
export function ColorDot({ color, isSmall = false }: IColorDotProps) {
  return <Decorative style={styles.dot(color, isSmall)} />;
}

const styles = StyleSheet.create((theme) => ({
  dot: (color: IColorRole, isSmall: boolean) => {
    const size = isSmall ? 8 : 10; // as bolinhas do design, sem token
    return { width: size, height: size, borderRadius: theme.radii.full, backgroundColor: theme.colors[color] };
  },
}));
