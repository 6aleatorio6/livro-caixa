import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useToastStore } from '@/core/store/toast.store';
import type { IToastKind } from '@/core/types/ToastKind';

/** O aviso do `useToastStore`, no pé da tela. Montado uma vez, pelo `AppContainer`. */
export function AppToast() {
  const { message, kind, isVisible } = useToastStore();
  if (!isVisible) return null;

  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast(kind)}>
      <Text style={styles.message(kind)}>{message}</Text>
    </View>
  );
}

// O core não importa do shared: o texto usa o papel de tipografia do tema direto, sem o AppText.
const styles = StyleSheet.create((theme, rt) => ({
  toast: (kind: IToastKind) => ({
    position: 'absolute',
    left: theme.spacing.large,
    right: theme.spacing.large,
    bottom: rt.insets.bottom + theme.spacing.large,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.radii.extraSmall,
    backgroundColor: kind === 'error' ? theme.colors.errorContainer : theme.colors.inverseSurface,
  }),
  message: (kind: IToastKind) => ({
    ...theme.typography.bodyMedium,
    color: kind === 'error' ? theme.colors.onErrorContainer : theme.colors.inverseOnSurface,
  }),
}));
