import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { formatMonthTitle } from '@/shared/utils/date/formatMonthTitle';
import { nextMonth } from '@/shared/utils/date/nextMonth';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

export interface IMonthSwitcherProps {
  /** O rótulo da aba, em cima do mês: "Pagamentos". */
  label: string;
  /** O mês mostrado, 'AAAA-MM'. */
  month: string;
  onMonthChange: (month: string) => void;
}

const BADGES = {
  current: { text: 'Este mês', background: 'primaryContainer', color: 'onPrimaryContainer' },
  next: { text: 'Mês que vem', background: 'tertiaryContainer', color: 'onTertiaryContainer' },
} as const;

/** O selo ao lado do rótulo: "Este mês" no mês atual, "Mês que vem" no próximo; os meses anteriores não têm. */
function badgeOf(month: string) {
  if (month === currentMonth()) return BADGES.current;
  if (month === nextMonth()) return BADGES.next;
  return null;
}

/**
 * O cabeçalho de uma aba por mês: o rótulo, com o selo do mês atual ou do próximo, o mês por extenso e os botões de
 * mês anterior e próximo. Não há próximo depois do próximo mês.
 */
export function MonthSwitcher({ label, month, onMonthChange }: IMonthSwitcherProps) {
  const badge = badgeOf(month);

  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        <View style={styles.labelRow}>
          <AppText variant="labelMedium" color="onSurfaceVariant">
            {label}
          </AppText>
          {badge ? (
            <View style={styles.badge(badge.background)}>
              <AppText variant="labelSmall" color={badge.color}>
                {badge.text}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText variant="headlineSmallEmphasized">{formatMonthTitle(month)}</AppText>
      </View>
      <View style={styles.buttons}>
        <IconButton icon={ChevronLeft} label="Mês anterior" onPress={() => onMonthChange(shiftMonth(month, -1))} />
        <IconButton
          icon={ChevronRight}
          label="Próximo mês"
          disabled={month === nextMonth()}
          onPress={() => onMonthChange(shiftMonth(month, 1))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titles: { gap: theme.spacing.extraExtraSmall },
  // A altura do selo, para o rótulo não pular quando o selo some nos meses anteriores.
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.small, minHeight: 20 },
  badge: (background: IColorRole) => ({
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.extraExtraSmall,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[background],
  }),
  buttons: { flexDirection: 'row' },
}));
