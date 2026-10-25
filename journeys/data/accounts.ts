// As contas de teste moram só aqui: os fluxos as leem de `output.accounts`, que o cenário `reset`
// devolve, cada uma com o link de entrada.
export const ACCOUNTS = {
  admin: { email: 'ana.souza@exemplo.com', name: 'Ana Souza', isAllowed: true, isAdmin: true },
  member: { email: 'bruno.souza@exemplo.com', name: 'Bruno Souza', isAllowed: true, isAdmin: false },
  outsider: { email: 'carla.lima@exemplo.com', name: 'Carla Lima', isAllowed: false, isAdmin: false },
};

/**
 * O link de teste que entra com uma conta Google inventada (`TestSignInPage`). Só funciona com o app
 * nos emuladores.
 */
export function toSignInLink({ email, name }: { email: string; name: string }) {
  return `livrocaixa://test-sign-in?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
}
