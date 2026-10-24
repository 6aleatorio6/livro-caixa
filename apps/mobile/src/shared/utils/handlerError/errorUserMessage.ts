import { AppError } from '@/shared/exceptions/AppError';

const GENERIC_USER_MESSAGE = 'Algo deu errado. Tente de novo.';

/** Erros de biblioteca que a pessoa consegue resolver, pelo `code` que a biblioteca põe no erro. */
const USER_MESSAGE_BY_CODE: Record<string, string> = {
  'auth/network-request-failed': 'Sem conexão. Confira a internet e tente de novo.',
  'auth/user-disabled': 'Esta conta foi desativada no Livro-Caixa.',
  PLAY_SERVICES_NOT_AVAILABLE: 'Este celular precisa do Google Play Services atualizado para entrar.',
};

/** O texto que a pessoa lê para um erro: o do `AppError`, o de um código conhecido, ou um genérico. */
export function errorUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.userMessage;
  const code = (error as { code?: unknown } | null)?.code;
  return (typeof code === 'string' && USER_MESSAGE_BY_CODE[code]) || GENERIC_USER_MESSAGE;
}
