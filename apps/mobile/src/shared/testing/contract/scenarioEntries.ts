import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

/**
 * Os cenários de um serviço como `[nome, cenário]`, para o `it.each`. O `satisfies` do arquivo de
 * cenários guarda o tipo próprio de cada um; aqui todos voltam ao tipo geral, com o `afterChange`.
 */
export function scenarioEntries<TInput, TResult>(scenarios: Record<string, IServiceScenario<TInput, TResult>>) {
  return Object.entries(scenarios);
}
