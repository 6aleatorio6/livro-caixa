import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { OVERDUE_LOOK } from '@/features/home/constants/overdueLook';
import type { IShareChoice } from '@/features/home/types/ShareChoice';
import { AppText } from '@/shared/components/AppText/AppText';
import { MONTH_BADGES } from '@/shared/constants/date/monthBadges';

// A pílula das atrasadas é a única de outra cor: vermelha quando escolhida, como o selo das contas.
const BADGE_BY_CHOICE: Record<IShareChoice, { text: string; background: IColorRole; color: IColorRole }> = {
  overdue: { text: 'Atrasadas', background: OVERDUE_LOOK.markColor, color: OVERDUE_LOOK.iconColor },
  thisMonth: MONTH_BADGES.current,
  nextMonth: MONTH_BADGES.next,
};

const MONTH_CHOICES: IShareChoice[] = ['thisMonth', 'nextMonth'];
const CHOICES_WITH_OVERDUE: IShareChoice[] = ['overdue', ...MONTH_CHOICES];

export interface IShareMonthFilterProps {
  /** Há conta atrasada: a pílula "Atrasadas" aparece antes das de mês. */
  hasOverdue: boolean;
  choice: IShareChoice;
  onChoiceChange: (choice: IShareChoice) => void;
}

/**
 * O filtro do compartilhar: as pílulas "Atrasadas" (só com conta atrasada), "Este mês" e "Mês que vem", a escolhida
 * nas cores do selo (o do `MonthSwitcher`, ou o vermelho das atrasadas) e as outras só com o contorno. É lido como
 * abas, e a escolhida como a aba selecionada.
 */
export function ShareMonthFilter({ hasOverdue, choice, onChoiceChange }: IShareMonthFilterProps) {
  const choices = hasOverdue ? CHOICES_WITH_OVERDUE : MONTH_CHOICES;

  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {choices.map((pillChoice) => {
        const isSelected = pillChoice === choice;
        const badge = BADGE_BY_CHOICE[pillChoice];

        return (
          <Pressable
            key={pillChoice}
            accessibilityRole="tab"
            accessibilityLabel={badge.text}
            accessibilityState={{ selected: isSelected }}
            // A pílula tem 32 dp de altura; o toque chega a 48.
            hitSlop={{ top: 8, bottom: 8 }}
            onPress={() => onChoiceChange(pillChoice)}
            style={({ pressed }) => styles.pill(isSelected, badge.background, pressed)}
          >
            <AppText variant="labelSmall" color={isSelected ? badge.color : 'onSurfaceVariant'}>
              {badge.text}
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
