import type { IRealtimeStatus } from './realtime-status';

export interface IRealtimeState<TResult> {
  status: IRealtimeStatus;
  data: TResult | null;
}
