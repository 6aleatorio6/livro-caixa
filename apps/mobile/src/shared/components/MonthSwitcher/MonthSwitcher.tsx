import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { formatMonthTitle } from '@/shared/utils/date/formatMonthTitle';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

export interface IMonthSwitcherProps {
  /** O rótulo da aba, em cima do mês: "Meus pagamentos". Sem ele, só o mês aparece e o cabeçalho tem 48 de altura. */
  label?: string;
  /** O mês mostrado, 'AAAA-MM'. */
  month: string;
  onMonthChange: (month: string) => void;
}

/** O cabeçalho de uma aba por mês: o rótulo (opcional), o mês por extenso e os botões de mês anterior e próximo. Não há próximo depois do mês atual. */
export function MonthSwitcher({ label, month, onMonthChange }: IMonthSwitcherProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        {label ? (
          <AppText variant="labelMedium" color="onSurfaceVariant">
            {label}
          </AppText>
        ) : null}
        <AppText variant="headlineSmallEmphasized">{formatMonthTitle(month)}</AppText>
      </View>
      <View style={styles.buttons}>
        <IconButton icon={ChevronLeft} label="Mês anterior" onPress={() => onMonthChange(shiftMonth(month, -1))} />
        <IconButton
          icon={ChevronRight}
          label="Próximo mês"
          disabled={month === currentMonth()}
          onPress={() => onMonthChange(shiftMonth(month, 1))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titles: { gap: theme.spacing.extraExtraSmall },
  buttons: { flexDirection: 'row' },
}));
