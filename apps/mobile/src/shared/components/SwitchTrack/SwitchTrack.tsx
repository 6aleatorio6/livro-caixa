import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface ISwitchTrackProps {
  isOn: boolean;
  /** Em 38% de opacidade: o interruptor não muda. */
  isDisabled?: boolean;
}

/**
 * O desenho do interruptor do Material 3, sem o toque nem o rótulo: quem o usa é a linha que liga e desliga, e é ela
 * que diz ao leitor de tela o papel e o estado. Desligado, o trilho tem a borda `outline` e a alça pequena; ligado, o
 * trilho é `primary` e a alça grande leva o check.
 */
export function SwitchTrack({ isOn, isDisabled = false }: ISwitchTrackProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.track(isOn, isDisabled)}>
      <View style={styles.handle(isOn)}>
        {isOn ? <Check size={16} color={theme.colors.onPrimaryContainer} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // O trilho de 52 × 32 e as alças de 16 e 24 são as medidas do interruptor do design, sem token. A alça fica a 4 da
  // borda ligada e a 6 desligada: no React Native a borda de 2 do desligado soma ao padding, então o padding é um só.
  track: (isOn: boolean, isDisabled: boolean) => ({
    width: 52,
    height: 32,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: isOn ? 'flex-end' : 'flex-start',
    paddingHorizontal: theme.spacing.extraSmall,
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
