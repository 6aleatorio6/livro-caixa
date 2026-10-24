import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface ICircleMarkProps {
  size: number;
  color: IColorRole;
  children: ReactNode;
}

/** O círculo de cor com um ícone ou uma inicial, ao lado do texto que diz o que ele marca. */
export function CircleMark({ size, color, children }: ICircleMarkProps) {
  return <Decorative style={styles.circle(size, color)}>{children}</Decorative>;
}

const styles = StyleSheet.create((theme) => ({
  circle: (size: number, color: IColorRole) => ({
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[color],
  }),
}));
