import { AppError } from './app-error';

const GENERIC_USER_MESSAGE = 'Algo deu errado. Tente de novo.';

/** O texto que a pessoa lê para um erro: o do `AppError`, ou um genérico para o inesperado. */
export function errorUserMessage(error: unknown): string {
  return error instanceof AppError ? error.userMessage : GENERIC_USER_MESSAGE;
}
