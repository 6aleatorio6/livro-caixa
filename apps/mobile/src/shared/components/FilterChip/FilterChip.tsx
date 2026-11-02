import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface IFilterChipProps {
  label: string;
  /** Escolhido: o chip ganha o fundo e o `check`. */
  isSelected?: boolean;
  /** O que vem antes do rótulo, como a bolinha da cor de uma tag. */
  leading?: ReactNode;
  /** Sem `onPress` o chip é só um rótulo, como na prévia da tag. */
  onPress?: () => void;
}

/** O chip de escolha do design: o rótulo, com o `check` quando escolhido. Com `onPress` é um botão que anuncia se está escolhido. */
export function FilterChip({ label, isSelected = false, leading, onPress }: IFilterChipProps) {
  const { theme } = useUnistyles();

  const content = (
    <>
      {isSelected ? (
        <Decorative>
          <Check size={16} color={theme.colors.onSecondaryContainer} />
        </Decorative>
      ) : null}
      {leading}
      <AppText variant="labelLarge" color={isSelected ? 'onSecondaryContainer' : 'onSurfaceVariant'}>
        {label}
      </AppText>
    </>
  );

  if (!onPress) return <View style={styles.chip(isSelected, false)}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => styles.chip(isSelected, pressed)}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: (isSelected: boolean, isPressed: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.small,
    height: 32, // a altura do design, sem token
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.radii.small,
    borderWidth: 1,
    borderColor: isSelected ? theme.colors.secondaryContainer : theme.colors.outlineVariant,
    backgroundColor: isSelected ? theme.colors.secondaryContainer : 'transparent',
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
}));
