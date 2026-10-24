import { useEffect, useState } from 'react';

import { errorUserMessage } from '@/shared/errors/error-user-message';
import { showToast } from '@/shared/store/show-toast';

import type { IRealtimeRef } from './realtime-ref';
import type { IRealtimeService } from './realtime-service';
import type { IRealtimeState } from './realtime-state';
import { subscribeToRefs } from './subscribe-to-refs';

const IDLE_STATE: IRealtimeState<never> = { status: 'idle', data: null };
const LOADING_STATE: IRealtimeState<never> = { status: 'loading', data: null };

/**
 * Escuta uma leitura em tempo real enquanto a tela está montada. Trocar os parâmetros (outro mês,
 * outro e-mail) fecha a escuta anterior e abre a nova; até a nova responder, o estado é `loading`.
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
    return subscribeToRefs(
      refs,
      (data, isFromCache) =>
        setDelivered({
          paramsKey,
          state: { status: isFromCache ? 'cached' : 'success', data: service.resolve(data, currentParams) },
        }),
      (error) => {
        setDelivered({ paramsKey, state: { status: 'error', data: null } });
        showToast(errorUserMessage(error), 'error');
      },
    );
  }, [service, paramsKey]);

  if (isIdle) return IDLE_STATE;
  if (delivered?.paramsKey !== paramsKey) return LOADING_STATE;
  return delivered.state;
}
