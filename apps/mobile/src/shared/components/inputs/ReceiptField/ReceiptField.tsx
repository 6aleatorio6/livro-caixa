import { useState } from 'react';

import { hideLoader } from '@/core/utils/storeActions/hideLoader';
import { showLoader } from '@/core/utils/storeActions/showLoader';
import { AppError } from '@/shared/exceptions/AppError';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';

export type IReceiptFieldProps = IInputMinimalProps<IReceipt | null> & {
  /** O comprovante já salvo do lançamento: aparece enquanto nenhum arquivo novo foi escolhido. */
  currentReceipt?: IReceiptFile;
};

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
export function ReceiptField({ value, onValueChange, onBlur, errorMessage, currentReceipt, disabled = false }: IReceiptFieldProps) {
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
      actionLabel={action}
      onPress={choose}
      disabled={disabled}
    />
  );
}
