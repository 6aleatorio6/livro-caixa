import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { formatCents } from '@/shared/utils/format/formatCents';

import { SplitBar } from '@/features/home/components/SplitBar/SplitBar';

export interface ISplitRowProps {
  /** O começo da linha: o ponto da cor (uma tag) ou o avatar com a inicial do nome (uma pessoa). */
  mark: 'dot' | 'avatar';
  name: string;
  /** Quanto pagou no mês, em centavos. */
  paidCents: number;
  /** O que a família pagou no mês, em centavos: a base da barra. */
  monthPaidCents: number;
  /** A cor do ponto e da barra. */
  color: IColorRole;
  /** Uma linha pequena sob a barra, como "e mais R$ 217,90 a pagar"; sem ela, nada aparece. */
  detail?: string;
}

/** Uma linha da divisão do mês, de uma tag ou de uma pessoa: o começo, o nome, o valor pago, a barra e o detalhe. */
export function SplitRow({ mark, name, paidCents, monthPaidCents, color, detail }: ISplitRowProps) {
  return (
    <View style={styles.split}>
      <View style={styles.line}>
        <View style={styles.name}>
          {mark === 'dot' ? (
            <Decorative style={styles.dot(color)} />
          ) : (
            <CircleMark size={28} color="secondaryContainer">
              <AppText variant="labelMediumEmphasized" color="onSecondaryContainer">
                {name.charAt(0).toUpperCase()}
              </AppText>
            </CircleMark>
          )}
          <AppText variant="titleMedium">{name}</AppText>
        </View>
        <AppText variant="titleMedium" numberOfLines={1}>
          {formatCents(paidCents)}
        </AppText>
      </View>
      <SplitBar paidCents={paidCents} monthPaidCents={monthPaidCents} color={color} />
      {detail ? (
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {detail}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  split: { gap: theme.spacing.small },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.small },
  dot: (role: IColorRole) => ({
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[role],
  }),
}));
