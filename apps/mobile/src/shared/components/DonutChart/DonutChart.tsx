import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface IDonutChartProps {
  /** Quanto já foi pago, em centavos. */
  paidCents: number;
  /** O total do anel, em centavos; o anel cheio é `paidCents >= totalCents`. */
  totalCents: number;
  /** O que o leitor de tela lê no lugar do desenho ("Já pago R$ 2.787,35 de R$ 3.005,25"). */
  accessibilityLabel: string;
  /** O que fica no centro do anel. */
  children?: ReactNode;
}

// As medidas do design (200 de diâmetro, anel de 12), sem token.
const SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * O anel do mês: o trilho inteiro e, por cima, o arco do que foi pago, que começa às 12 h e anda no sentido
 * horário, com as pontas redondas. Sem pago não há arco; pago igual ou acima do total fecha o anel.
 */
export function DonutChart({ paidCents, totalCents, accessibilityLabel, children }: IDonutChartProps) {
  const { theme } = useUnistyles();
  const paidShare = totalCents > 0 ? Math.min(paidCents / totalCents, 1) : 0;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          testID="donut-track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={theme.colors.primaryContainer}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {paidShare > 0 ? (
          <Circle
            testID="donut-arc"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.primary}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={[CIRCUMFERENCE * paidShare, CIRCUMFERENCE]}
            fill="none"
            // O círculo do SVG começa às 3 h; girar -90° leva o começo às 12 h, ainda no sentido horário.
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        ) : null}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { width: SIZE, height: SIZE },
  svg: { position: 'absolute' },
  center: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.extraExtraSmall,
  },
}));
