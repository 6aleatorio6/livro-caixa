import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { MONTH_BADGES } from '@/shared/constants/date/monthBadges';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

export interface IShareMonthFilterProps {
  /** O mês da pílula "Este mês", 'AAAA-MM'; a "Mês que vem" é o seguinte. */
  thisMonth: string;
  /** O mês escolhido, 'AAAA-MM': o de uma das duas pílulas. */
  month: string;
  onMonthChange: (month: string) => void;
}

/**
 * O filtro de mês do compartilhar: as pílulas "Este mês" e "Mês que vem", a escolhida nas cores do selo do
 * `MonthSwitcher` e a outra só com o contorno. É lido como abas, e a escolhida como a aba selecionada.
 */
export function ShareMonthFilter({ thisMonth, month, onMonthChange }: IShareMonthFilterProps) {
  const pills = [
    { badge: MONTH_BADGES.current, month: thisMonth },
    { badge: MONTH_BADGES.next, month: shiftMonth(thisMonth, 1) },
  ];

  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {pills.map((pill) => {
        const isSelected = pill.month === month;

        return (
          <Pressable
            key={pill.month}
            accessibilityRole="tab"
            accessibilityLabel={pill.badge.text}
            accessibilityState={{ selected: isSelected }}
            // A pílula tem 32 dp de altura; o toque chega a 48.
            hitSlop={{ top: 8, bottom: 8 }}
            onPress={() => onMonthChange(pill.month)}
            style={({ pressed }) => styles.pill(isSelected, pill.badge.background, pressed)}
          >
            <AppText variant="labelSmall" color={isSelected ? pill.badge.color : 'onSurfaceVariant'}>
              {pill.badge.text}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// A escolhida não tem contorno no design; a borda transparente mantém o tamanho das duas iguais. O design desenha o
// contorno por dentro do padding de 12, então a borda sai do padding.
const PILL_BORDER_WIDTH = 1;

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.small },
  pill: (isSelected: boolean, background: IColorRole, isPressed: boolean) => ({
    height: 32, // a altura do design, sem token
    paddingHorizontal: theme.spacing.medium - PILL_BORDER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    borderWidth: PILL_BORDER_WIDTH,
    borderColor: isSelected ? 'transparent' : theme.colors.outlineVariant,
    backgroundColor: isSelected ? theme.colors[background] : 'transparent',
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
}));
