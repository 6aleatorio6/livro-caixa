import { router } from 'expo-router';
import { useState } from 'react';

import { hideLoader } from '@/core/utils/storeActions/hideLoader';
import { showLoader } from '@/core/utils/storeActions/showLoader';
import { AppError } from '@/shared/exceptions/AppError';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { createReceiptUnreadableError } from '@/shared/utils/file/createReceiptUnreadableError';
import { openReceiptPreview } from '@/shared/utils/file/openReceiptPreview';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';

export type IReceiptFieldProps = IInputMinimalProps<IReceipt | null> & {
  /** O comprovante já salvo do lançamento: aparece enquanto nenhum arquivo novo foi escolhido. */
  currentReceipt?: IReceiptFile;
  /** O lançamento do `currentReceipt`: com ele, o comprovante salvo abre no visualizador do lançamento. */
  entryId?: string;
};

const UNREADABLE_MESSAGE = createReceiptUnreadableError().userMessage;

interface IRejection {
  message: string;
  fileName: string;
}

/**
 * O comprovante da conta: uma linha que, com um arquivo anexado, o abre em tela cheia ao toque, para conferir o valor,
 * e deixa a escolha de outro para o "Trocar"; vazia ou com um arquivo recusado, o toque em qualquer parte abre o
 * seletor de arquivos. O arquivo escolhido passa por `prepareReceipt` (a imagem grande é reduzida, com o carregamento
 * cobrindo a tela); se for recusado (ou se o seletor falha), o campo mostra o motivo e o nome do arquivo e zera o
 * valor, para o formulário não enviar o arquivo de antes. Cancelar o seletor não muda nada.
 */
export function ReceiptField({
  value,
  onValueChange,
  onBlur,
  errorMessage,
  currentReceipt,
  entryId,
  disabled = false,
}: IReceiptFieldProps) {
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
  // O arquivo recusado não é mostrado como anexado; sem arquivo novo, vale o comprovante já salvo.
  const shown = rejection ? null : (value ?? currentReceipt ?? null);
  const action = rejection ? 'Escolher outro' : shown ? 'Trocar' : 'Escolher';

  return (
    <ReceiptSummary
      file={shown}
      errorMessage={errorText}
      rejectedFileName={rejection?.fileName}
      action={{ label: action, onPress: choose }}
      onOpen={rejection ? undefined : openerOf(value, currentReceipt && entryId)}
      disabled={disabled}
    />
  );
}

/** O arquivo novo abre do celular; sem ele, o salvo abre no visualizador do lançamento `savedEntryId`, se houver. */
function openerOf(value: IReceipt | null, savedEntryId: string | undefined) {
  if (value) return () => openReceiptPreview(value);
  if (savedEntryId) return () => router.push({ pathname: '/entries/[id]/receipt', params: { id: savedEntryId } });
  return undefined;
}
