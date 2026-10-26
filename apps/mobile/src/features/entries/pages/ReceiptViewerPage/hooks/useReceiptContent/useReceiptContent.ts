import { useEffect, useState } from 'react';

import { AppError } from '@/shared/exceptions/AppError';
import { getReceiptContentService } from '@/shared/services/file/getReceiptContentService';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';

type IOutcome = { status: 'ready'; uri: string } | { status: 'notFound' } | { status: 'error' };

interface IState {
  /** A tentativa em curso; o `retry` a incrementa. */
  attempt: number;
  /** O resultado guarda o arquivo e a tentativa a que pertence: outra tentativa ou outro arquivo volta a "carregando". */
  result: { fileId: string; attempt: number; outcome: IOutcome } | null;
}

/**
 * A `uri` para abrir o comprovante `file`, pedida uma vez (e de novo no `retry`). O `fail` marca como erro uma `uri`
 * que não abriu a imagem; o `attempt` muda a cada nova tentativa, para a tela remontar o visualizador. Sem `file` (o
 * registro ainda não chegou), fica carregando.
 */
export function useReceiptContent(file: Pick<IReceiptFile, 'id' | 'contentType'> | null) {
  const [{ attempt, result }, setState] = useState<IState>({ attempt: 0, result: null });
  const fileId = file?.id ?? null;
  const contentType = file?.contentType ?? null;

  useEffect(() => {
    if (!fileId || !contentType) return;
    let isCurrent = true;
    const settle = (outcome: IOutcome) =>
      isCurrent && setState((current) => ({ ...current, result: { fileId, attempt, outcome } }));
    getReceiptContentService(fileId, contentType).then(
      (uri) => settle({ status: 'ready', uri }),
      (error: unknown) => {
        const isMissing = error instanceof AppError && error.code === 'RECEIPT_NOT_FOUND';
        settle({ status: isMissing ? 'notFound' : 'error' });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [fileId, contentType, attempt]);

  const outcome = result?.fileId === fileId && result.attempt === attempt ? result.outcome : null;

  return {
    status: outcome?.status ?? 'loading',
    uri: outcome?.status === 'ready' ? outcome.uri : null,
    attempt,
    fail: () => {
      if (fileId) setState((current) => ({ ...current, result: { fileId, attempt, outcome: { status: 'error' } } }));
    },
    retry: () => setState((current) => ({ ...current, attempt: current.attempt + 1 })),
  };
}
