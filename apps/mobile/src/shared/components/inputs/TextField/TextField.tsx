import { useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { AppText } from '@/shared/components/AppText/AppText';

export interface ITextFieldProps
  extends IInputMinimalProps<string>, Pick<TextInputProps, 'keyboardType' | 'autoCapitalize' | 'placeholder'> {
  label: string;
}

/** Campo de texto com rótulo, marca de obrigatório e mensagem de erro embaixo. */
export function TextField({
  label,
  value,
  onValueChange,
  onBlur,
  errorMessage,
  isRequired = false,
  disabled = false,
  ...inputProps
}: ITextFieldProps) {
  const { theme } = useUnistyles();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(errorMessage);

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" color={hasError ? 'error' : 'onSurfaceVariant'}>
        {label}
        {isRequired && (
          // O leitor de tela não lê o `*`: o campo anuncia o obrigatório na dica de acessibilidade.
          <AppText color="error" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {' *'}
          </AppText>
        )}
      </AppText>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityHint={isRequired ? 'Campo obrigatório' : undefined}
        accessibilityState={{ disabled }}
        editable={!disabled}
        value={value}
        onChangeText={onValueChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={styles.input(isFocused, hasError, disabled)}
      />
      {hasError && (
        <AppText variant="bodySmall" color="error" accessibilityLiveRegion="polite">
          {errorMessage}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.spacing.extraSmall },
  input: (isFocused: boolean, hasError: boolean, isDisabled: boolean) => ({
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
    minHeight: 56,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.radii.extraSmall,
    borderWidth: isFocused || hasError ? 2 : 1,
    borderColor: hasError ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.outline,
    opacity: isDisabled ? 0.38 : 1,
  }),
}));
