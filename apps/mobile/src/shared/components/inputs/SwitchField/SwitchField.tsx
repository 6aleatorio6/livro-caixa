import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

export interface ISwitchFieldProps extends IInputMinimalProps<boolean> {
  /** O que o interruptor liga: "Paguei só uma parte". */
  label: string;
  /** O texto de apoio embaixo do rótulo: o que acontece ao ligar, ou por que ele está travado. */
  supportText?: string;
  /** Aparece ligado e desabilitado, qualquer que seja o valor: uma regra decidiu por ele. */
  isLockedOn?: boolean;
}

/**
 * Um interruptor do Material 3 com o rótulo e o apoio à esquerda: a linha inteira liga e desliga. Desligado, o
 * trilho tem a borda `outline` e a alça pequena; ligado, o trilho é `primary` e a alça grande leva o check.
 * Desabilitado, fica em 38% de opacidade e não muda.
 */
export function SwitchField(props: ISwitchFieldProps) {
  // O `value` vem do contrato dos campos (`IInputMinimalProps`), que não tem o prefixo dos booleanos.
  const { label, supportText, onValueChange, onBlur, isLockedOn = false } = props;
  const { theme } = useUnistyles();
  const isOn = isLockedOn || props.value;
  const isDisabled = isLockedOn || Boolean(props.disabled);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={supportText}
      accessibilityState={{ checked: isOn, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => {
        onValueChange(!props.value);
        onBlur();
      }}
      style={styles.row}
    >
      <View style={styles.texts}>
        <AppText variant="bodyLarge">{label}</AppText>
        {supportText ? (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {supportText}
          </AppText>
        ) : null}
      </View>
      <View style={styles.track(isOn, isDisabled)}>
        <View style={styles.handle(isOn)}>
          {isOn ? <Check size={16} color={theme.colors.onPrimaryContainer} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium, padding: theme.spacing.extraSmall },
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
  // O trilho de 52 × 32 e as alças de 16 e 24 são as medidas do interruptor do design, sem token.
  track: (isOn: boolean, isDisabled: boolean) => ({
    width: 52,
    height: 32,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isOn ? 'flex-end' : 'flex-start',
    paddingHorizontal: isOn ? theme.spacing.extraSmall : theme.spacing.extraSmallIncreased,
    backgroundColor: isOn ? theme.colors.primary : theme.colors.surfaceContainerHighest,
    borderWidth: isOn ? 0 : 2,
    borderColor: theme.colors.outline,
    opacity: isDisabled ? theme.opacity.disabled : 1,
  }),
  handle: (isOn: boolean) => ({
    width: isOn ? 24 : 16,
    height: isOn ? 24 : 16,
    borderRadius: theme.radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isOn ? theme.colors.onPrimary : theme.colors.outline,
  }),
}));
