import { authenticateAsync, type LocalAuthenticationResult } from 'expo-local-authentication';

/**
 * O próximo pedido do sistema fica aberto até o teste responder, como com o dedo ainda fora do leitor. Devolve a função
 * que responde. O teste mocka `expo-local-authentication` com fábrica, com `authenticateAsync` um `jest.fn()`.
 */
export function holdNextPromptOpen() {
  let answer!: (result: LocalAuthenticationResult) => void;
  jest.mocked(authenticateAsync).mockReturnValueOnce(
    new Promise((resolve) => {
      answer = resolve;
    }),
  );
  return answer;
}
