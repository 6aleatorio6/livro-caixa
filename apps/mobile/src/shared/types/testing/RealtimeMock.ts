import type { IRealtimeRef } from '@/shared/types/realtime/RealtimeRef';
import type { IRealtimeService } from '@/shared/types/realtime/RealtimeService';
import type { IRealtimeStatus } from '@/shared/types/realtime/RealtimeStatus';

import type { IServiceScenario } from './ServiceScenario';

/** O que o `mockRealtime` entrega para um serviço: o resultado de um cenário, ou um estado sem dado. */
export type IRealtimeMock = { service: IRealtimeService<never, readonly IRealtimeRef[], unknown> } & (
  | { scenario: IServiceScenario<unknown, unknown> }
  | { status: Exclude<IRealtimeStatus, 'cached' | 'success'> }
);
