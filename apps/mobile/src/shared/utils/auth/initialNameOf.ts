import type { User } from '@react-native-firebase/auth';

/** O limite do nome que as regras aceitam. */
const MAX_NAME_LENGTH = 60;

/**
 * O nome que a pessoa ganha na primeira entrada: o da conta Google e, sem ele, o começo do e-mail
 * (até o @), cortado em 60 caracteres, o limite das regras: um nome maior seria recusado e a gravação
 * da primeira entrada falharia sem aviso.
 */
export function initialNameOf(user: Pick<User, 'displayName' | 'email'>) {
  const name = user.displayName?.trim() || user.email?.split('@')[0] || '';
  return name.slice(0, MAX_NAME_LENGTH).trim();
}
