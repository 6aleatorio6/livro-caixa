import { AppError } from '@/shared/exceptions/AppError';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

/**
 * Faz o serviço, mockado no teste com fábrica, recusar como o cenário recusado diz: lança o `AppError`
 * com o `code` e o `userMessage` que o contrato viu o serviço lançar. A chamada se confere no teste, como
 * em `mockServiceScenario`.
 */
export function mockServiceRejection<TInput extends unknown[]>(
  service: (...args: TInput) => Promise<unknown>,
  rejected: IServiceScenario<TInput, { code: string; userMessage: string }>,
) {
  const { code, userMessage } = rejected.result;
  // O `message` é para quem desenvolve: o contrato só confere o `code` e o `userMessage`.
  jest.mocked(service).mockRejectedValue(new AppError(code, userMessage, code));
}
