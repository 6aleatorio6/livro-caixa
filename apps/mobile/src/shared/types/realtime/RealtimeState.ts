import type { IRealtimeStatus } from './RealtimeStatus';

export interface IRealtimeState<TResult> {
  status: IRealtimeStatus;
  data: TResult | null;
}
