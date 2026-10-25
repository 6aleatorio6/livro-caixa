import { Modal, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';

export interface IConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** O rótulo da ação que confirma ("Excluir"); ela é a destrutiva, à direita de "Cancelar". */
  confirmLabel: string;
  onConfirm: () => void;
  /** Chamado pelo "Cancelar" e pelo botão voltar do Android. */
  onCancel: () => void;
}

/** O diálogo que pede a confirmação de uma ação que desfaz algo, sobre o véu do tema. */
export function ConfirmDialog({ visible, title, message, confirmLabel, onConfirm, onCancel }: IConfirmDialogProps) {
  return (
    <Modal testID="confirm-dialog" transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.scrim} />
        <View accessibilityViewIsModal style={styles.dialog}>
          <AppText variant="headlineSmall" accessibilityRole="header">
            {title}
          </AppText>
          {message ? (
            <AppText variant="bodyMedium" color="onSurfaceVariant">
              {message}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <Button variant="text" label="Cancelar" onPress={onCancel} />
            <Button variant="textDestructive" label={confirmLabel} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.largeIncreased },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.scrim, opacity: theme.opacity.scrim },
  dialog: {
    width: 312, // a largura do design, sem token
    maxWidth: '100%',
    gap: theme.spacing.large,
    padding: theme.spacing.extraLarge,
    borderRadius: theme.radii.extraLarge,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.small },
}));
