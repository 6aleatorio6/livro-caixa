import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Decorative } from '@/shared/components/Decorative/Decorative';
import type { ITagColorOption } from '@/shared/types/tag/TagColorOption';
import type { ITagColorRoles } from '@/shared/types/tag/TagColorRoles';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';

export interface IColorSwatchProps {
  option: ITagColorOption;
  isSelected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/** Uma cor do seletor: o círculo da cor num alvo de toque de 48, com a borda e o `check` quando escolhida. */
export function ColorSwatch({ option, isSelected, disabled = false, onPress }: IColorSwatchProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityState={{ checked: isSelected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => styles.target(isSelected, pressed)}
    >
      <View style={styles.circle(tagColorRoles(option.color).mainRole)}>
        {isSelected ? (
          <Decorative>
            <Check size={20} color={theme.colors.surface} />
          </Decorative>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  target: (isSelected: boolean, isPressed: boolean) => ({
    width: 48, // o alvo de toque do design, sem token
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.extraLargeDecreased,
    borderWidth: 2,
    borderColor: isSelected ? theme.colors.onSurface : 'transparent',
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
  circle: (role: ITagColorRoles['mainRole']) => ({
    width: 40, // o círculo visível do design, sem token
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.largeIncreased,
    backgroundColor: theme.colors[role],
  }),
}));
