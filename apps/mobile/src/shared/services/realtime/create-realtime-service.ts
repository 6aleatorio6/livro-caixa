import type { IRealtimeRef } from './realtime-ref';
import type { IRealtimeService } from './realtime-service';

/**
 * Declara uma leitura em tempo real. Só fixa os tipos: o `const` mantém a tupla das refs, para o
 * `resolve` receber os dados de cada uma no tipo dela.
 */
export function createRealtimeService<TParams, const TRefs extends readonly IRealtimeRef[], TResult>(
  service: IRealtimeService<TParams, TRefs, TResult>,
) {
  return service;
}
