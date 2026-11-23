import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { ConfirmButton } from '@/shared/components/ConfirmButton/ConfirmButton';

export interface IDeleteWithConfirmProps {
  /** O rótulo do botão que abre a confirmação ("Excluir tag"). */
  label: string;
  /** O título do diálogo ("Excluir a tag Casa?"). */
  dialogTitle: string;
  dialogMessage: string;
  /** Desliga o botão; com o `disabledReason`, o texto abaixo diz por quê. */
  disabled?: boolean;
  disabledReason?: string;
  /** Mostra o motivo embaixo do botão; quem põe o botão numa linha com outros o mostra embaixo da linha. */
  shouldShowReason?: boolean;
  /** Chamado depois que o diálogo fecha, com a exclusão confirmada. */
  onConfirm: () => void | Promise<void>;
}

/** O `ConfirmButton` de excluir, com o botão destrutivo e o "Excluir" no diálogo, e o motivo de estar desligado. */
export function DeleteWithConfirm({
  label,
  dialogTitle,
  dialogMessage,
  disabled = false,
  disabledReason,
  shouldShowReason = true,
  onConfirm,
}: IDeleteWithConfirmProps) {
  return (
    <View style={styles.section}>
      <ConfirmButton
        label={label}
        variant="textDestructive"
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel="Excluir"
        disabled={disabled}
        onConfirm={onConfirm}
      />
      {disabled && disabledReason && shouldShowReason ? (
        <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.reason}>
          {disabledReason}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { alignItems: 'center', gap: theme.spacing.small },
  reason: { textAlign: 'center' },
}));
