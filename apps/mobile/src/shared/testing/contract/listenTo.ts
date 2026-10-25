import type { IRealtimeRef } from '@/shared/types/realtime/RealtimeRef';
import type { IRealtimeService } from '@/shared/types/realtime/RealtimeService';
import { subscribeToRefs } from '@/shared/utils/serviceUtils/subscribeToRefs';

import { OPEN_READINGS } from './openReadings';

/**
 * Abre a leitura em tempo real do serviço pelo `subscribeToRefs` do app e guarda, em ordem, o que o
 * `resolve` devolve a cada entrega do servidor. O que vem do cache fica de fora: o contrato é o servidor.
 * A leitura fecha no fim do teste (`contractSetup.ts`).
 */
export function listenTo<TParams, TRefs extends readonly IRealtimeRef[], TResult>(
  service: IRealtimeService<TParams, TRefs, TResult>,
  params: TParams,
) {
  const results: TResult[] = [];
  let failure: Error | null = null;
  let wakeUp: () => void = () => {};
  let readCount = 0;

  const stop = subscribeToRefs(
    service.refs(params),
    (data, isFromCache) => {
      if (isFromCache) return;
      results.push(service.resolve(data, params));
      wakeUp();
    },
    (error) => {
      failure = error;
      wakeUp();
    },
  );
  OPEN_READINGS.add(stop);

  /** A próxima entrega do servidor; rejeita com o erro da leitura. */
  async function next(): Promise<TResult> {
    while (readCount === results.length) {
      if (failure) throw failure;
      await new Promise<void>((resolve) => {
        wakeUp = resolve;
      });
    }
    return results[readCount++];
  }

  return { next };
}
