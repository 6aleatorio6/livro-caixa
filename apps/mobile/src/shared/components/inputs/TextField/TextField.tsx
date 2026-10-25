import { CircleAlert } from 'lucide-react-native';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, TextInput, type TextInputProps, useAnimatedValue, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { AppText } from '@/shared/components/AppText/AppText';
import { RequiredMark } from '@/shared/components/inputs/RequiredMark/RequiredMark';

// O rótulo que sobe para a borda encolhe a esta escala, perto do bodySmall.
const FLOATED_LABEL_SCALE = 0.78;
// O recorte da borda passa um pouco do rótulo de cada lado, para ele não encostar no traço.
const NOTCH_PADDING = 4;
const BORDER_WIDTH = 1;
// A faixa do recorte sobra para cima e para baixo do traço: sem isso, um fio da borda aparece sob o rótulo.
const NOTCH_OVERSHOOT = 2;
const FLOAT_DURATION_MS = 100;
const FLOAT_RANGE = [0, 1];

export interface ITextFieldProps
  extends IInputMinimalProps<string>, Pick<TextInputProps, 'keyboardType' | 'autoCapitalize' | 'placeholder'> {
  label: string;
  /** O texto de apoio sob o campo; some quando há erro, que ocupa o lugar dele. */
  supportText?: string;
  /** A cor do que está atrás do campo: o recorte do rótulo na borda é pintado com ela. */
  surfaceColor?: IColorRole;
}

/**
 * Campo de texto com borda (o "outlined" do Material): vazio e sem foco, o rótulo fica dentro da caixa,
 * no lugar do valor; com foco ou valor, sobe para a borda, num recorte. A mensagem de erro vem embaixo.
 */
export function TextField({
  label,
  supportText,
  surfaceColor = 'surface',
  value,
  onValueChange,
  onBlur,
  errorMessage,
  isRequired = false,
  disabled = false,
  placeholder,
  ...inputProps
}: ITextFieldProps) {
  const { theme } = useUnistyles();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [boxHeight, setBoxHeight] = useState(0);
  const [labelSize, setLabelSize] = useState({ width: 0, height: 0 });
  const hasError = Boolean(errorMessage);
  const isFloated = isFocused || Boolean(value);
  // De 0, o rótulo no lugar do valor, a 1, o rótulo na borda.
  const floatProgress = useAnimatedValue(isFloated ? 1 : 0);

  useEffect(() => {
    // `top`, `color` e a largura do recorte não andam pelo driver nativo.
    Animated.timing(floatProgress, { toValue: isFloated ? 1 : 0, duration: FLOAT_DURATION_MS, useNativeDriver: false }).start();
  }, [floatProgress, isFloated]);

  const borderColor = hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.outline;
  const labelColor = hasError
    ? theme.colors.error
    : floatProgress.interpolate({ inputRange: FLOAT_RANGE, outputRange: [theme.colors.onSurfaceVariant, theme.colors.primary] });
  const labelTop = floatProgress.interpolate({
    inputRange: FLOAT_RANGE,
    outputRange: [(boxHeight - labelSize.height) / 2, -labelSize.height / 2],
  });
  const labelScale = floatProgress.interpolate({ inputRange: FLOAT_RANGE, outputRange: [1, FLOATED_LABEL_SCALE] });

  return (
    <View style={styles.container(disabled)}>
      {/* Metade da altura do rótulo acima da caixa: é onde ele fica quando sobe para a borda. */}
      <View style={{ marginTop: labelSize.height / 2 }}>
        <View pointerEvents="none" style={[styles.outline, { borderColor }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.notch,
            {
              width: labelSize.width * FLOATED_LABEL_SCALE + NOTCH_PADDING * 2,
              backgroundColor: theme.colors[surfaceColor],
              opacity: floatProgress,
            },
          ]}
        />
        <Animated.Text
          pointerEvents="none"
          onLayout={(event) => setLabelSize(event.nativeEvent.layout)}
          style={[styles.label, { top: labelTop, color: labelColor, transform: [{ scale: labelScale }] }]}
        >
          {label}
          {isRequired && <RequiredMark />}
        </Animated.Text>
        <Pressable
          accessible={false}
          disabled={disabled}
          onPress={() => inputRef.current?.focus()}
          onLayout={(event) => setBoxHeight(event.nativeEvent.layout.height)}
          style={styles.box}
        >
          <TextInput
            {...inputProps}
            ref={inputRef}
            accessibilityLabel={label}
            accessibilityHint={isRequired ? 'Campo obrigatório' : undefined}
            accessibilityState={{ disabled }}
            editable={!disabled}
            // Com o rótulo no lugar do valor, o placeholder ficaria por baixo dele.
            placeholder={isFloated ? placeholder : undefined}
            value={value}
            onChangeText={onValueChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur();
            }}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            // Sem isto o cursor e a seleção ficam no verde-azulado padrão do Android.
            cursorColor={theme.colors.primary}
            selectionColor={theme.colors.primary}
            selectionHandleColor={theme.colors.primary}
            style={styles.input}
          />
          {hasError && <CircleAlert size={20} color={theme.colors.error} accessible={false} />}
        </Pressable>
      </View>
      {hasError ? (
        <AppText variant="bodySmall" color="error" accessibilityLiveRegion="polite" style={styles.supportText}>
          {errorMessage}
        </AppText>
      ) : (
        supportText && (
          <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.supportText}>
            {supportText}
          </AppText>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: (isDisabled: boolean) => ({
    gap: theme.spacing.extraSmall,
    opacity: isDisabled ? theme.opacity.disabled : 1,
  }),
  outline: {
    position: 'absolute',
    inset: 0,
    borderWidth: BORDER_WIDTH,
    borderRadius: theme.radii.extraSmall,
    zIndex: 1,
  },
  notch: {
    position: 'absolute',
    top: -NOTCH_OVERSHOOT / 2,
    left: theme.spacing.large - NOTCH_PADDING,
    height: BORDER_WIDTH + NOTCH_OVERSHOOT,
    zIndex: 2,
  },
  label: {
    ...theme.typography.bodyLarge,
    position: 'absolute',
    left: theme.spacing.large,
    transformOrigin: 'left center',
    zIndex: 3,
  },
  box: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
  },
  input: {
    ...theme.typography.bodyLarge,
    flex: 1,
    color: theme.colors.onSurface,
    padding: 0,
  },
  supportText: { paddingHorizontal: theme.spacing.large },
}));
