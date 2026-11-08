import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { SwitchTrack } from '@/shared/components/SwitchTrack/SwitchTrack';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

export interface ISwitchFieldProps extends IInputMinimalProps<boolean> {
  /** O que o interruptor liga: "Paguei só uma parte". */
  label: string;
  /** O texto de apoio embaixo do rótulo: o que acontece ao ligar, ou por que ele está travado. */
  supportText?: string;
  /** Aparece ligado e desabilitado, qualquer que seja o valor: uma regra decidiu por ele. */
  isLockedOn?: boolean;
}

/** Um interruptor do Material 3 com o rótulo e o apoio à esquerda: a linha inteira liga e desliga. */
export function SwitchField(props: ISwitchFieldProps) {
  // O `value` vem do contrato dos campos (`IInputMinimalProps`), que não tem o prefixo dos booleanos.
  const { label, supportText, onValueChange, onBlur, isLockedOn = false } = props;
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
      <SwitchTrack isOn={isOn} isDisabled={isDisabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium, padding: theme.spacing.extraSmall },
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
