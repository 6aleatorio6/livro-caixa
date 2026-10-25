import { useEffect, useState } from 'react';

import type { IRealtimeRef } from '@/shared/types/realtime/RealtimeRef';
import type { IRealtimeService } from '@/shared/types/realtime/RealtimeService';
import type { IRealtimeState } from '@/shared/types/realtime/RealtimeState';
import { subscribeToRefs } from '@/shared/utils/serviceUtils/subscribeToRefs';

const IDLE_STATE: IRealtimeState<never> = { status: 'idle', data: null };
const LOADING_STATE: IRealtimeState<never> = { status: 'loading', data: null };

// Espera antes de escutar de novo depois de cada erro seguido; passada a lista, fica no último.
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000];

/**
 * Escuta uma leitura em tempo real enquanto a tela está montada. Trocar os parâmetros (outro mês,
 * outro e-mail) fecha a escuta anterior e abre a nova; até a nova responder, o estado é `loading`.
 *
 * Uma escuta que falha (regras negando por um instante) não fica em
 * `error` para sempre: o hook escuta de novo depois de uma espera crescente e, enquanto espera,
 * mantém o `error`. Não mostra aviso: a tela já mostra o estado de erro.
 */
export function useRealtime<TParams, TRefs extends readonly IRealtimeRef[], TResult>(
  service: IRealtimeService<TParams, TRefs, TResult>,
  params: TParams,
): IRealtimeState<TResult> {
  const paramsKey = JSON.stringify(params);
  // O que a escuta entregou, junto dos parâmetros a que pertence: um dado de outros parâmetros não vale.
  const [delivered, setDelivered] = useState<{ paramsKey: string; state: IRealtimeState<TResult> } | null>(null);
  const isIdle = service.refs(params).length === 0;

  useEffect(() => {
    const currentParams = JSON.parse(paramsKey) as TParams;
    const refs = service.refs(currentParams);
    if (refs.length === 0) return;
    let failures = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;

    const listen = () => {
      unsubscribe = subscribeToRefs(
        refs,
        (data, isFromCache) => {
          failures = 0;
          setDelivered({
            paramsKey,
            state: { status: isFromCache ? 'cached' : 'success', data: service.resolve(data, currentParams) },
          });
        },
        () => {
          setDelivered({ paramsKey, state: { status: 'error', data: null } });
          retryTimer = setTimeout(listen, RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)]);
          failures += 1;
        },
      );
    };
    listen();

    return () => {
      clearTimeout(retryTimer);
      unsubscribe?.();
    };
  }, [service, paramsKey]);

  if (isIdle) return IDLE_STATE;
  if (delivered?.paramsKey !== paramsKey) return LOADING_STATE;
  return delivered.state;
}
