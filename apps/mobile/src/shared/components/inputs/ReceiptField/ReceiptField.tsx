import { FileCheck, FileX, Image, Paperclip } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { hideLoader } from '@/core/utils/storeActions/hideLoader';
import { showLoader } from '@/core/utils/storeActions/showLoader';
import { AppError } from '@/shared/exceptions/AppError';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { formatFileSize } from '@/shared/utils/format/formatFileSize';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';

export type IReceiptFieldProps = IInputMinimalProps<IReceipt | null>;

const UNREADABLE_MESSAGE = 'Não deu para ler o arquivo. Escolha outro.';

interface IRejection {
  message: string;
  fileName: string;
}

/**
 * O comprovante da conta: uma linha em que o toque, em qualquer parte, abre o seletor de arquivos. O arquivo
 * escolhido passa por `prepareReceipt` (a imagem grande é reduzida, com o carregamento cobrindo a tela); se for
 * recusado (ou se o seletor falha), o campo mostra o motivo e o nome do arquivo e zera o valor, para o formulário
 * não enviar o arquivo de antes. Cancelar o seletor não muda nada.
 */
export function ReceiptField({ value, onValueChange, onBlur, errorMessage, disabled = false }: IReceiptFieldProps) {
  const { theme } = useUnistyles();
  const [rejection, setRejection] = useState<IRejection | null>(null);

  const choose = async () => {
    let fileName = 'Nenhum arquivo anexado';
    let isPreparing = false;
    try {
      const file = await pickReceiptFile();
      // Cancelar o seletor não muda nada.
      if (!file) return;

      isPreparing = true;
      fileName = file.name;
      showLoader();
      onValueChange(await prepareReceipt(file));
      setRejection(null);
    } catch (error) {
      isPreparing = true;
      // O arquivo recusado não vai no envio: sem o valor de antes, o formulário volta a pedir o comprovante.
      onValueChange(null);
      // O seletor que rejeita (um toque duplo) ou o arquivo que não se lê não trazem mensagem própria.
      setRejection({ message: error instanceof AppError ? error.userMessage : UNREADABLE_MESSAGE, fileName });
    } finally {
      if (isPreparing) {
        hideLoader();
        onBlur();
      }
    }
  };

  const errorText = rejection?.message ?? errorMessage;
  const hasError = Boolean(errorText);
  const attached = rejection ? null : value;

  const markColor = hasError ? 'errorContainer' : attached ? 'primaryContainer' : 'secondaryContainer';
  const iconColor = theme.colors[hasError ? 'onErrorContainer' : attached ? 'onPrimaryContainer' : 'onSecondaryContainer'];
  const Icon = rejection ? FileX : attached ? (attached.type === 'pdf' ? FileCheck : Image) : Paperclip;
  const typeName = attached?.type === 'pdf' ? 'PDF' : 'Imagem';
  const attachedLabel = attached
    ? `${typeName} · ${attached.wasReduced ? 'comprimida para ' : ''}${formatFileSize(attached.sizeBytes)}`
    : null;
  const label = errorText ?? attachedLabel ?? 'Comprovante';
  const fileText = rejection?.fileName ?? attached?.name ?? 'Nenhum arquivo anexado';
  const action = rejection ? 'Escolher outro' : attached ? 'Trocar' : 'Escolher';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Comprovante: ${hasError ? `${errorText} ` : ''}${fileText}. ${action}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={choose}
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
        {action}
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
