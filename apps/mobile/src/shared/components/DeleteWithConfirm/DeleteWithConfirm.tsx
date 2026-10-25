import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';

export interface IDeleteWithConfirmProps {
  /** O rótulo do botão que abre a confirmação ("Excluir tag"). */
  label: string;
  /** O título do diálogo ("Excluir a tag Casa?"). */
  dialogTitle: string;
  dialogMessage: string;
  /** Desliga o botão; com o `disabledReason`, o texto abaixo diz por quê. */
  disabled?: boolean;
  disabledReason?: string;
  /** Chamado depois que o diálogo fecha, com a exclusão confirmada. */
  onConfirm: () => void | Promise<void>;
}

/** O botão de excluir que abre a confirmação; confirmada, o diálogo fecha e `onConfirm` faz a exclusão. */
export function DeleteWithConfirm({ label, dialogTitle, dialogMessage, disabled = false, disabledReason, onConfirm }: IDeleteWithConfirmProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  async function confirm() {
    setIsConfirming(false);
    await onConfirm();
  }

  return (
    <View style={styles.section}>
      <Button label={label} variant="textDestructive" disabled={disabled} onPress={() => setIsConfirming(true)} />
      {disabled && disabledReason ? (
        <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.reason}>
          {disabledReason}
        </AppText>
      ) : null}
      <ConfirmDialog
        visible={isConfirming}
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel="Excluir"
        onConfirm={confirm}
        onCancel={() => setIsConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { alignItems: 'center', gap: theme.spacing.small },
  reason: { textAlign: 'center' },
}));
