import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import type { ITagColor } from '@/shared/types/tag/TagColor';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';

export interface ITagChipProps {
  name: string;
  color: ITagColor;
  /** Escolhida: o chip ganha o fundo e o `check`. */
  isSelected?: boolean;
  /** Sem `onPress` o chip é só um rótulo, como na prévia da tag. */
  onPress?: () => void;
}

/** O nome de uma tag com a bolinha da sua cor. Com `onPress` é um botão que anuncia se está escolhido. */
export function TagChip({ name, color, isSelected = false, onPress }: ITagChipProps) {
  const { theme } = useUnistyles();

  const content = (
    <>
      {isSelected ? (
        <Decorative>
          <Check size={16} color={theme.colors.onSecondaryContainer} />
        </Decorative>
      ) : null}
      <Decorative style={styles.dot(color)} />
      <AppText variant="labelLarge" color={isSelected ? 'onSecondaryContainer' : 'onSurfaceVariant'}>
        {name}
      </AppText>
    </>
  );

  if (!onPress) return <View style={styles.chip(isSelected, false)}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
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
  dot: (color: ITagColor) => ({
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[tagColorRoles(color).mainRole],
  }),
}));
