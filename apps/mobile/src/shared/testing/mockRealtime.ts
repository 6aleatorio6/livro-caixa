import { useEffect, useState } from 'react';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import type { IRealtimeState } from '@/shared/types/realtime/RealtimeState';
import type { IRealtimeMock } from '@/shared/types/testing/RealtimeMock';

/**
 * Faz o `useRealtime`, mockado no teste com fábrica, entregar a cada serviço o resultado de um cenário
 * ou um estado sem dado. A tela tem de ler com os parâmetros do cenário: outros parâmetros, ou um
 * serviço sem mock, derrubam o teste, porque o contrato só conferiu o serviço com aquela entrada.
 */
export function mockRealtime(...mocks: IRealtimeMock[]) {
  const changedServices = new Set<unknown>();
  const rerenders = new Set<() => void>();

  jest.mocked(useRealtime).mockImplementation(function useRealtimeMock(service, params) {
    const [, setChangeCount] = useState(0);
    useEffect(() => {
      const rerender = () => setChangeCount((count) => count + 1);
      rerenders.add(rerender);
      return () => {
        rerenders.delete(rerender);
      };
    }, []);

    const mock = mocks.find((candidate) => candidate.service === service);
    if (!mock) throw new Error(`O useRealtime não tem mock para a leitura com ${JSON.stringify(params)}.`);
    if ('status' in mock) return { status: mock.status, data: null };
    // A tela tem de ler com a entrada do cenário: o contrato só conferiu o serviço com ela.
    expect(params).toEqual(mock.scenario.input);
    const { result, afterChange } = mock.scenario;
    const data = changedServices.has(service) && afterChange ? afterChange.result : result;
    return { status: 'success', data } as IRealtimeState<never>;
  });

  return {
    /** A leitura do serviço passa a entregar o `afterChange` do cenário. Chame dentro de `act`. */
    applyChange(service: IRealtimeMock['service']) {
      changedServices.add(service);
      rerenders.forEach((rerender) => rerender());
    },
  };
}
