import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IToastKind } from '@/shared/store/toast-kind';
import { useToastStore } from '@/shared/store/toast.store';

import { AppText } from './app-text';

/** O aviso do `useToastStore`, no pé da tela. Montado uma vez, pelo `AppContainer`. */
export function AppToast() {
  const { message, kind, isVisible } = useToastStore();
  if (!isVisible) return null;

  return (
    <View accessible accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast(kind)}>
      <AppText variant="bodyMedium" color={kind === 'error' ? 'onErrorContainer' : 'inverseOnSurface'}>
        {message}
      </AppText>
    </View>
  );
}

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
}));
