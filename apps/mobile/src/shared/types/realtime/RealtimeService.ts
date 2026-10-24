import type { IRealtimeRef } from './RealtimeRef';
import type { IRefsData } from './RefsData';

/** Uma leitura em tempo real: as refs que ela escuta para os parâmetros, e como junta os dados. */
export interface IRealtimeService<TParams, TRefs extends readonly IRealtimeRef[], TResult> {
  /** Uma lista vazia deixa a leitura parada (`idle`), por exemplo enquanto falta um parâmetro. */
  refs(params: TParams): TRefs;
  resolve(data: IRefsData<TRefs>, params: TParams): TResult;
}
