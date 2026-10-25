/** Como o app chama a pessoa: pelo nome e, enquanto ela não entrou e não tem nome, pelo e-mail. */
export function displayNameOf({ name, email }: { name: string | null; email: string }) {
  return name ?? email;
}
