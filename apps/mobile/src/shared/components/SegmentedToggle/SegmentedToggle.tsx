import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';

export interface ISegmentedToggleProps<TValue extends string> {
  options: { value: TValue; label: string }[];
  value: TValue;
  onChange: (value: TValue) => void;
}

/** A alternância entre vistas ("Por tag" / "Por membro"): o segmento ativo ganha o fundo e é lido como aba escolhida. */
export function SegmentedToggle<TValue extends string>({ options, value, onChange }: ISegmentedToggleProps<TValue>) {
  return (
    <View accessibilityRole="tablist" style={styles.track}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => styles.segment(isActive, pressed)}
          >
            <AppText variant="labelLarge" color={isActive ? 'onSecondaryContainer' : 'onSurfaceVariant'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: 'row',
    height: 44, // a altura do design, sem token
    padding: theme.spacing.extraSmall,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  segment: (isActive: boolean, isPressed: boolean) => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.full,
    backgroundColor: isActive ? theme.colors.secondaryContainer : 'transparent',
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
}));
