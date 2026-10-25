/**
 * O que um campo de tela precisa receber para ser ligado a um formulário. `onValueChange` é método,
 * e não propriedade, para que um campo de texto (`value: string`) caiba em `IInputMinimalProps<unknown>`.
 */
export interface IInputMinimalProps<TValue> {
  value: TValue;
  onValueChange(value: TValue): void;
  onBlur(): void;
  errorMessage?: string;
  isRequired?: boolean;
  disabled?: boolean;
}
