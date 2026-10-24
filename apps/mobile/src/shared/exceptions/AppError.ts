/**
 * Um erro esperado, que a pessoa precisa entender. `message` é para quem desenvolve, em inglês;
 * `userMessage` é o texto que aparece na tela, em pt-BR.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly userMessage: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
