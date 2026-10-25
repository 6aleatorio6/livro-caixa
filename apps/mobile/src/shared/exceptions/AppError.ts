/**
 * Um erro esperado, que a pessoa precisa entender. `message` é para quem desenvolve, em inglês;
 * `userMessage` é o texto que aparece na tela, em pt-BR. `code` (opcional) é o código do contrato
 * para quem trata o erro pelo tipo, como `TAG_NAME_IN_USE`.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly userMessage: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
