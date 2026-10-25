import { File } from 'expo-file-system';
import { useIncomingShare } from 'expo-sharing';
import { useEffect, useState } from 'react';

import { useSharedReceiptStore } from '@/shared/store/sharedReceipt.store';
import type { ILocalFile } from '@/shared/types/file/LocalFile';
import type { IReceipt } from '@/shared/types/file/Receipt';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';
import { errorUserMessage } from '@/shared/utils/handlerError/errorUserMessage';
import { clearSharedReceipt } from '@/shared/utils/sharedReceipt/clearSharedReceipt';
import { setSharedReceipt } from '@/shared/utils/sharedReceipt/setSharedReceipt';

type ISharedReceiptResult =
  | { status: 'resolving' }
  | { status: 'empty' }
  | { status: 'ready'; receipt: IReceipt }
  /** `message` é o texto da recusa, em pt-BR. */
  | { status: 'rejected'; message: string };

/**
 * Lê o arquivo que o Android compartilhou com o app, passa pelo `prepareReceipt` de sempre e o guarda no
 * `sharedReceipt.store`. Um compartilhamento novo troca o anterior; depois de preparado, o que o
 * `expo-sharing` guardou é limpo.
 */
export function useSharedReceipt(): ISharedReceiptResult {
  const { sharedPayloads, resolvedSharedPayloads, clearSharedPayloads, isResolving, error } = useIncomingShare();
  const storedReceipt = useSharedReceiptStore((state) => state.receipt);
  // A recusa vale para o arquivo que a causou: outro `contentUri` a deixa de lado sem precisar limpá-la.
  const [rejection, setRejection] = useState<{ contentUri: string; message: string } | null>(null);
  const payload = resolvedSharedPayloads[0];
  const contentUri = payload?.contentUri;

  useEffect(() => {
    if (!payload?.contentUri) return;
    // Um arquivo novo parte do zero: o comprovante do anterior não vale enquanto este é preparado.
    clearSharedReceipt();
    const file: ILocalFile = {
      uri: payload.contentUri,
      name: payload.originalName ?? 'comprovante',
      contentType: payload.contentMimeType ?? payload.mimeType ?? '',
      // O provedor nem sempre informa o tamanho: lê do arquivo, como o `pickReceiptFile`.
      sizeBytes: payload.contentSize ?? new File(payload.contentUri).size,
    };

    let isCurrent = true;
    prepareReceipt(file)
      .then((receipt) => {
        if (!isCurrent) return;
        setSharedReceipt(receipt);
        clearSharedPayloads();
      })
      .catch((preparationError: unknown) => {
        if (!isCurrent) return;
        setRejection({ contentUri: file.uri, message: errorUserMessage(preparationError) });
        clearSharedPayloads();
      });
    return () => {
      isCurrent = false;
    };
    // O efeito depende do arquivo (o `contentUri`), não do objeto do payload, que muda a cada leitura do mesmo arquivo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentUri, clearSharedPayloads]);

  if (rejection && rejection.contentUri === contentUri) return { status: 'rejected', message: rejection.message };
  if (error) return { status: 'rejected', message: errorUserMessage(error) };
  if (storedReceipt) return { status: 'ready', receipt: storedReceipt };
  // Sem nada guardado, nada a preparar e nada a chegar: a rota foi aberta sem compartilhamento.
  if (payload || isResolving || sharedPayloads.length > 0) return { status: 'resolving' };
  return { status: 'empty' };
}
