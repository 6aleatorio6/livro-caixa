import type { ComponentType } from 'react';
import { type FieldPath, type FieldValues, useController } from 'react-hook-form';

import type { IAppForm } from './app-form';
import type { IInputMinimalProps } from './input-minimal-props';

type ISmartInputProps<TProps, TValues extends FieldValues> = Omit<TProps, keyof IInputMinimalProps<unknown>> & {
  form: IAppForm<TValues>;
  name: FieldPath<TValues>;
  disabled?: boolean;
};

/**
 * Liga um campo de tela a um formulário: valor, mudança, saída do campo, erro e marca de
 * obrigatório saem do `form` e do `name`, e a tela não repete essa ligação a cada campo.
 */
export function createInputSmartWrapper<TProps extends IInputMinimalProps<unknown>>(Input: ComponentType<TProps>) {
  return function SmartInput<TValues extends FieldValues>({ form, name, ...props }: ISmartInputProps<TProps, TValues>) {
    const { field, fieldState } = useController({ control: form.control, name });
    const inputProps = {
      ...props,
      value: field.value,
      onValueChange: field.onChange,
      onBlur: field.onBlur,
      errorMessage: fieldState.error?.message,
      isRequired: form.requiredFieldNames.has(name),
    } as unknown as TProps;
    return <Input {...inputProps} />;
  };
}
