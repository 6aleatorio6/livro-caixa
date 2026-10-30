import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface IColorDotProps {
  color: IColorRole;
}

/** A bolinha de cor do design, ao lado do nome de uma tag: só enfeite, o leitor de tela lê o nome. */
export function ColorDot({ color }: IColorDotProps) {
  return <Decorative style={styles.dot(color)} />;
}

const styles = StyleSheet.create((theme) => ({
  dot: (color: IColorRole) => ({
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[color],
  }),
}));
