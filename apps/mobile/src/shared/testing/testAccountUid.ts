/**
 * O uid das contas de teste dos contratos. O emulador do Auth sortearia um a cada teste, mas aceita
 * criar a conta com o uid que o teste quiser (`createAuthAccount`), e assim um cenário pode citá-lo.
 */
export function testAccountUid(email: string) {
  return `uid-${email.trim().toLowerCase()}`;
}
