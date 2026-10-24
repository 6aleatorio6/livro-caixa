import type { IRealtimeRef } from './realtime-ref';
import type { IRefsData } from './refs-data';

/** Uma leitura em tempo real: as refs que ela escuta para os parâmetros, e como junta os dados. */
export interface IRealtimeService<TParams, TRefs extends readonly IRealtimeRef[], TResult> {
  /** Uma lista vazia deixa a leitura parada (`idle`), por exemplo enquanto falta um parâmetro. */
  refs(params: TParams): TRefs;
  resolve(data: IRefsData<TRefs>, params: TParams): TResult;
}
