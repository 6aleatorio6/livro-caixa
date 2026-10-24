/** O id do documento em `allowedEmails`: o e-mail sem espaços nas pontas e em minúsculas. */
export function allowedEmailId(email: string) {
  return email.trim().toLowerCase();
}
