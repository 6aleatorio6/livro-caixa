/** Vai no `context` do react-hook-form porque o `control` é a única coisa do formulário que o campo recebe. */
export interface IAppFormContext {
  isFieldRequired(name: string, values?: object): boolean;
}
