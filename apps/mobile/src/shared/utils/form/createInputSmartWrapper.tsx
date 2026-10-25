import type { ComponentType } from 'react';
import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';
import { isRequiredInForm } from '@/shared/utils/form/isRequiredInForm';

type ISmartInputProps<TProps, TValues extends FieldValues> = Omit<TProps, keyof IInputMinimalProps<unknown>> & {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  disabled?: boolean;
};

/**
 * Liga um campo de tela a um formulário: valor, mudança, saída do campo, erro e marca de
 * obrigatório saem do `control` e do `name`, e a tela não repete essa ligação a cada campo. É aqui,
 * e só aqui, que o campo encontra o react-hook-form.
 */
export function createInputSmartWrapper<TProps extends IInputMinimalProps<unknown>>(Input: ComponentType<TProps>) {
  return function SmartInput<TValues extends FieldValues>({
    control,
    name,
    ...props
  }: ISmartInputProps<TProps, TValues>) {
    const { field, fieldState } = useController({ control, name });
    const inputProps = {
      ...props,
      value: field.value,
      onValueChange: field.onChange,
      onBlur: field.onBlur,
      errorMessage: fieldState.error?.message,
      isRequired: isRequiredInForm(control, name),
    } as unknown as TProps;
    return <Input {...inputProps} />;
  };
}
