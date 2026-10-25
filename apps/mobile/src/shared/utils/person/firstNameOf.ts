/** A primeira palavra do nome de exibição da pessoa; o e-mail (de quem ainda não entrou) fica inteiro. */
export function firstNameOf(displayName: string) {
  return displayName.includes('@') ? displayName : (displayName.trim().split(/\s+/)[0] ?? displayName);
}
