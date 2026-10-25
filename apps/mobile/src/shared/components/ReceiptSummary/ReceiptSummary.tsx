import { FileCheck, FileX, Image, Paperclip } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { formatFileSize } from '@/shared/utils/format/formatFileSize';

export interface IReceiptSummaryProps {
  /** O comprovante mostrado; `null` é o campo vazio ("Nenhum arquivo anexado"). `wasReduced` só vale para a imagem recém-escolhida. */
  file: { name: string; type: 'image' | 'pdf'; sizeBytes: number; wasReduced?: boolean } | null;
  /** O motivo de erro, que troca o tipo e o tamanho e pinta a linha com a cor de erro. */
  errorMessage?: string;
  /** O nome do arquivo recusado, mostrado no lugar de `file` com a marca de arquivo inválido. */
  rejectedFileName?: string;
  /** O texto da ação à direita: "Ver" na folha de detalhes, "Trocar" ou "Escolher" no formulário. */
  actionLabel: string;
  onPress: () => void;
  disabled?: boolean;
}

/** A linha do comprovante: a marca com o tipo de arquivo, o tipo e o tamanho, o nome e a ação. Toda ela é o alvo do toque. */
export function ReceiptSummary({ file, errorMessage, rejectedFileName, actionLabel, onPress, disabled = false }: IReceiptSummaryProps) {
  const { theme } = useUnistyles();

  const hasError = Boolean(errorMessage);
  const attached = rejectedFileName === undefined ? file : null;

  const markColor = hasError ? 'errorContainer' : attached ? 'primaryContainer' : 'secondaryContainer';
  const iconColor = theme.colors[hasError ? 'onErrorContainer' : attached ? 'onPrimaryContainer' : 'onSecondaryContainer'];
  const Icon = rejectedFileName !== undefined ? FileX : attached ? (attached.type === 'pdf' ? FileCheck : Image) : Paperclip;
  const typeName = attached?.type === 'pdf' ? 'PDF' : 'Imagem';
  const attachedLabel = attached
    ? `${typeName} · ${attached.wasReduced ? 'comprimida para ' : ''}${formatFileSize(attached.sizeBytes)}`
    : null;
  const label = errorMessage ?? attachedLabel ?? 'Comprovante';
  const fileText = rejectedFileName ?? attached?.name ?? 'Nenhum arquivo anexado';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Comprovante: ${hasError ? `${errorMessage} ` : ''}${fileText}. ${actionLabel}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => styles.field(hasError, disabled, pressed)}
    >
      <CircleMark size={40} color={markColor}>
        <Icon size={20} color={iconColor} />
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant="labelMedium" color={hasError ? 'error' : 'onSurfaceVariant'}>
          {label}
        </AppText>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {fileText}
        </AppText>
      </View>
      <AppText variant="labelLarge" color="primary">
        {actionLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  field: (hasError: boolean, isDisabled: boolean, isPressed: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.medium,
    // No design a borda está dentro dos 70 de altura e do respiro [14, 16]; no React Native ela soma por fora
    // (1 normal, 2 no erro), então o respiro cede o que a borda ocupa.
    paddingVertical: theme.spacing.mediumIncreased - (hasError ? 2 : 1),
    paddingHorizontal: theme.spacing.large - (hasError ? 2 : 1),
    borderRadius: theme.radii.medium,
    borderWidth: hasError ? 2 : 1,
    borderColor: theme.colors[hasError ? 'error' : 'outlineVariant'],
    backgroundColor: theme.colors.surfaceContainerLow,
    opacity: isDisabled ? theme.opacity.disabled : isPressed ? theme.opacity.pressed : 1,
  }),
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
