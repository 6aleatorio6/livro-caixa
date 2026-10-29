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
  /**
   * A ação à direita: "Ver" na folha de detalhes, "Trocar" ou "Escolher" no formulário. Sem `onOpen`, o toque em
   * qualquer parte da linha a faz; sem nenhum dos dois, a linha é só leitura.
   */
  action?: { label: string; onPress: () => void };
  /** Abre o arquivo mostrado, pelo toque na linha. Com uma `action` junto, a ação vira um alvo de toque à parte. */
  onOpen?: () => void;
  disabled?: boolean;
  /** O arquivo veio do compartilhamento do Android: o texto de cima começa com "Veio do compartilhamento · ". */
  isShared?: boolean;
}

/**
 * A linha do comprovante: a marca com o tipo de arquivo, o tipo e o tamanho, o nome e a ação. Com um alvo só, toda
 * ela é o alvo do toque; com `onOpen` e `action`, a ação fica com a parte da direita e o resto da linha abre o arquivo.
 */
export function ReceiptSummary({
  file,
  errorMessage,
  rejectedFileName,
  action,
  onOpen,
  disabled = false,
  isShared = false,
}: IReceiptSummaryProps) {
  const { theme } = useUnistyles();

  const hasError = Boolean(errorMessage);
  const attached = rejectedFileName === undefined ? file : null;

  const markColor = hasError ? 'errorContainer' : attached ? 'primaryContainer' : 'secondaryContainer';
  const iconColor =
    theme.colors[hasError ? 'onErrorContainer' : attached ? 'onPrimaryContainer' : 'onSecondaryContainer'];
  const Icon =
    rejectedFileName !== undefined ? FileX : attached ? (attached.type === 'pdf' ? FileCheck : Image) : Paperclip;
  const typeName = attached?.type === 'pdf' ? 'PDF' : 'Imagem';
  const attachedLabel = attached
    ? `${isShared ? 'Veio do compartilhamento · ' : ''}${typeName} · ${attached.wasReduced ? 'comprimida para ' : ''}${formatFileSize(attached.sizeBytes)}`
    : null;
  const label = errorMessage ?? attachedLabel ?? 'Comprovante';
  const fileText = rejectedFileName ?? attached?.name ?? 'Nenhum arquivo anexado';

  const summary = (
    <>
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
    </>
  );
  const actionText = action ? (
    <AppText variant="labelLarge" color="primary">
      {action.label}
    </AppText>
  ) : null;
  const description = `Comprovante: ${hasError ? `${errorMessage} ` : ''}${fileText}`;

  if (onOpen && action) {
    return (
      <View style={styles.frame(hasError, disabled)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${description}. ${OPEN_LABEL}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onOpen}
          style={({ pressed }) => styles.openTarget(hasError, pressed)}
        >
          {summary}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${description}. ${action.label}`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={action.onPress}
          style={({ pressed }) => styles.actionTarget(hasError, pressed)}
        >
          {actionText}
        </Pressable>
      </View>
    );
  }

  const target = onOpen ? { label: OPEN_LABEL, onPress: onOpen } : action;

  if (!target) {
    return (
      <View accessible accessibilityLabel={description} style={styles.field(hasError, false, false)}>
        {summary}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${description}. ${target.label}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={target.onPress}
      style={({ pressed }) => styles.field(hasError, disabled, pressed)}
    >
      {summary}
      {actionText}
    </Pressable>
  );
}

/** O que o toque na linha faz quando ela abre o arquivo, dito para o leitor de tela. */
const OPEN_LABEL = 'Ver';

// No design a borda está dentro dos 70 de altura e do respiro [14, 16]; no React Native ela soma por fora (1 normal,
// 2 no erro), então o respiro cede o que a borda ocupa.
const borderWidthOf = (hasError: boolean) => (hasError ? 2 : 1);

const styles = StyleSheet.create((theme) => ({
  field: (hasError: boolean, isDisabled: boolean, isPressed: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.medium,
    paddingVertical: theme.spacing.mediumIncreased - borderWidthOf(hasError),
    paddingHorizontal: theme.spacing.large - borderWidthOf(hasError),
    borderRadius: theme.radii.medium,
    borderWidth: borderWidthOf(hasError),
    borderColor: theme.colors[hasError ? 'error' : 'outlineVariant'],
    backgroundColor: theme.colors.surfaceContainerLow,
    opacity: isDisabled ? theme.opacity.disabled : isPressed ? theme.opacity.pressed : 1,
  }),
  // Com dois alvos, a moldura não tem respiro: cada alvo leva o seu, para o toque valer até a borda.
  frame: (hasError: boolean, isDisabled: boolean) => ({
    flexDirection: 'row',
    borderRadius: theme.radii.medium,
    borderWidth: borderWidthOf(hasError),
    borderColor: theme.colors[hasError ? 'error' : 'outlineVariant'],
    backgroundColor: theme.colors.surfaceContainerLow,
    opacity: isDisabled ? theme.opacity.disabled : 1,
  }),
  openTarget: (hasError: boolean, isPressed: boolean) => ({
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.medium,
    paddingVertical: theme.spacing.mediumIncreased - borderWidthOf(hasError),
    paddingLeft: theme.spacing.large - borderWidthOf(hasError),
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
  // O respiro da esquerda é o vão entre os textos e a ação da linha de um alvo só.
  actionTarget: (hasError: boolean, isPressed: boolean) => ({
    justifyContent: 'center',
    paddingVertical: theme.spacing.mediumIncreased - borderWidthOf(hasError),
    paddingLeft: theme.spacing.medium,
    paddingRight: theme.spacing.large - borderWidthOf(hasError),
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
