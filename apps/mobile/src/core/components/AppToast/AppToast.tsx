import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useToastStore } from '@/core/store/toast.store';
import type { IColorRole } from '@/core/types/ColorRole';
import type { IToastKind } from '@/core/types/ToastKind';
import { hideToast } from '@/core/utils/storeActions/hideToast';

// A área de toque do botão passa do texto, que é pequeno; o design não a desenha.
const ACTION_HIT_SLOP = 8;

// O aviso de erro usa as cores de erro do tema; o de sucesso, as inversas, que destacam o aviso da tela.
const COLORS_BY_KIND: Record<IToastKind, { background: IColorRole; message: IColorRole; action: IColorRole }> = {
  success: { background: 'inverseSurface', message: 'inverseOnSurface', action: 'inversePrimary' },
  error: { background: 'errorContainer', message: 'onErrorContainer', action: 'onErrorContainer' },
};

/** O aviso do `useToastStore`, no pé da tela. Montado uma vez, pelo `AppContainer`. */
export function AppToast() {
  const toast = useToastStore((state) => state.toast);
  if (!toast) return null;

  const { message, kind, action } = toast;

  // Com a ação, o aviso não agrupa o conteúdo para o leitor de tela: o botão precisa ser um foco próprio.
  return (
    <View accessible={!action} accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast(kind)}>
      <Text style={styles.message(kind)}>{message}</Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={ACTION_HIT_SLOP}
          onPress={() => {
            hideToast();
            action.onPress();
          }}
        >
          <Text style={styles.action(kind)}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// O core não importa do shared: o texto usa o papel de tipografia do tema direto, sem o AppText.
const styles = StyleSheet.create((theme, rt) => ({
  toast: (kind: IToastKind) => ({
    position: 'absolute',
    left: theme.spacing.largeIncreased,
    right: theme.spacing.largeIncreased,
    bottom: rt.insets.bottom + theme.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.large,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.small,
    backgroundColor: theme.colors[COLORS_BY_KIND[kind].background],
  }),
  // O texto quebra a linha antes de empurrar o botão para fora do aviso.
  message: (kind: IToastKind) => ({
    flexShrink: 1,
    flexGrow: 1,
    ...theme.typography.bodyMedium,
    color: theme.colors[COLORS_BY_KIND[kind].message],
  }),
  action: (kind: IToastKind) => ({
    ...theme.typography.labelLarge,
    color: theme.colors[COLORS_BY_KIND[kind].action],
  }),
}));
