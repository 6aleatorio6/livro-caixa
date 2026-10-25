import { useEffect, useState } from 'react';

import { AppError } from '@/shared/exceptions/AppError';
import { getReceiptUrlService } from '@/shared/services/file/getReceiptUrlService';

type IOutcome = { status: 'ready'; url: string } | { status: 'notFound' } | { status: 'error' };

interface IState {
  /** A tentativa em curso; o `retry` a incrementa. */
  attempt: number;
  /** O resultado guarda o arquivo e a tentativa a que pertence: outra tentativa ou outro arquivo volta a "carregando". */
  result: { storagePath: string; attempt: number; outcome: IOutcome } | null;
}

/**
 * O endereço para abrir o comprovante guardado em `storagePath`, pedido uma vez (e de novo no `retry`). O
 * `fail` marca como erro um endereço que não abriu o arquivo; o `attempt` muda a cada nova tentativa, para a
 * tela remontar o visualizador. Sem `storagePath` (o registro ainda não chegou), fica carregando.
 */
export function useReceiptUrl(storagePath: string | null) {
  const [{ attempt, result }, setState] = useState<IState>({ attempt: 0, result: null });

  useEffect(() => {
    if (!storagePath) return;
    let isCurrent = true;
    const settle = (outcome: IOutcome) =>
      isCurrent && setState((current) => ({ ...current, result: { storagePath, attempt, outcome } }));
    getReceiptUrlService(storagePath).then(
      (url) => settle({ status: 'ready', url }),
      (error: unknown) => {
        const isMissing = error instanceof AppError && error.code === 'RECEIPT_NOT_FOUND';
        settle({ status: isMissing ? 'notFound' : 'error' });
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [storagePath, attempt]);

  const outcome = result?.storagePath === storagePath && result.attempt === attempt ? result.outcome : null;

  return {
    status: outcome?.status ?? 'loading',
    url: outcome?.status === 'ready' ? outcome.url : null,
    attempt,
    fail: () => {
      if (storagePath)
        setState((current) => ({ ...current, result: { storagePath, attempt, outcome: { status: 'error' } } }));
    },
    retry: () => setState((current) => ({ ...current, attempt: current.attempt + 1 })),
  };
}
