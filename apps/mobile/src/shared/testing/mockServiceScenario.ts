import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

/**
 * Faz o serviço, mockado no teste com fábrica, resolver com o resultado do cenário. A chamada se
 * confere no teste, com `toHaveBeenCalledWith(...scenario.input)`: um erro lançado aqui dentro sumiria
 * no aviso que o `createAsyncAction` mostra.
 */
export function mockServiceScenario<TInput extends unknown[], TResult>(
  service: (...args: TInput) => Promise<unknown>,
  scenario: IServiceScenario<TInput, TResult>,
) {
  // O resultado do cenário traz só os campos que as telas leem.
  jest.mocked(service).mockResolvedValue(scenario.result as never);
}
