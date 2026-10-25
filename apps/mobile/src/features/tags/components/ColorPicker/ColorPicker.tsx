import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { TAG_COLORS } from '@/shared/constants/tag/tagColors';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';
import type { ITagColor } from '@/shared/types/tag/TagColor';

import { ColorSwatch } from '@/features/tags/components/ColorSwatch/ColorSwatch';

export type IColorPickerProps = IInputMinimalProps<ITagColor>;

/** As oito cores de tag em duas fileiras de quatro; escolher uma desmarca a outra. */
export function ColorPicker({ value, onValueChange, onBlur, disabled }: IColorPickerProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Cor" style={styles.picker}>
      {TAG_COLORS.map((option) => (
        <ColorSwatch
          key={option.color}
          option={option}
          isSelected={option.color === value}
          disabled={disabled}
          onPress={() => {
            onValueChange(option.color);
            onBlur();
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Quatro amostras de 48 e três vãos de 12 enchem 228: a quinta quebra para a segunda fileira.
  picker: {
    width: 228, // a largura do seletor no design, sem token
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.spacing.medium,
    rowGap: theme.spacing.small,
  },
}));
