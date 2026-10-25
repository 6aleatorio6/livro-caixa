import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface ISplitBarProps {
  /** Quanto este item pagou no mês, em centavos. */
  paidCents: number;
  /** O que a família pagou no mês, em centavos: a barra ocupa a parte dele que o item pagou. Zero deixa a barra vazia. */
  monthPaidCents: number;
  color: IColorRole;
}

/** A barra de 8 dp da divisão do mês: o trilho `surfaceContainerHigh` e, nele, a parte da cor. */
export function SplitBar({ paidCents, monthPaidCents, color }: ISplitBarProps) {
  const share = monthPaidCents > 0 ? paidCents / monthPaidCents : 0;
  const percent = Math.min(Math.max(share, 0), 1) * 100;

  return (
    <Decorative style={styles.track}>
      <View testID="split-bar-fill" style={styles.fill(percent, color)} />
    </Decorative>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    height: 8, // a altura do design, sem token
    borderRadius: theme.radii.extraSmall,
    backgroundColor: theme.colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: (percent: number, color: IColorRole) => ({
    width: `${percent}%`,
    height: 8,
    borderRadius: theme.radii.extraSmall,
    backgroundColor: theme.colors[color],
  }),
}));
