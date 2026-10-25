import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useToastStore } from '@/core/store/toast.store';
import type { IToastKind } from '@/core/types/ToastKind';

/** O aviso do `useToastStore`, no pé da tela. Montado uma vez, pelo `AppContainer`. */
export function AppToast() {
  const toast = useToastStore((state) => state.toast);
  if (!toast) return null;

  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast(toast.kind)}>
      <Text style={styles.message(toast.kind)}>{toast.message}</Text>
    </View>
  );
}

// O core não importa do shared: o texto usa o papel de tipografia do tema direto, sem o AppText.
const styles = StyleSheet.create((theme, rt) => ({
  toast: (kind: IToastKind) => ({
    position: 'absolute',
    left: theme.spacing.largeIncreased,
    right: theme.spacing.largeIncreased,
    bottom: rt.insets.bottom + theme.spacing.large,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.small,
    backgroundColor: kind === 'error' ? theme.colors.errorContainer : theme.colors.inverseSurface,
  }),
  message: (kind: IToastKind) => ({
    ...theme.typography.bodyMedium,
    color: kind === 'error' ? theme.colors.onErrorContainer : theme.colors.inverseOnSurface,
  }),
}));
