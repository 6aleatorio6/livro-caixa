import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

import { useAppForm } from './use-app-form';

/** Fixa o schema e os valores iniciais de um formulário e devolve o hook da tela. */
export function createFormHook<TValues extends FieldValues>(
  schema: ObjectSchema<TValues>,
  defaultValues: DefaultValues<TValues>,
) {
  return function useFormHook() {
    return useAppForm(schema, defaultValues);
  };
}
