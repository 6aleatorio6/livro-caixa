import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

import { useAppForm } from '@/shared/hooks/useAppForm/useAppForm';

/** Fixa o schema e os valores iniciais de um formulário e devolve o hook da tela. */
export function createFormHook<TValues extends FieldValues, TExtraContext extends object = object>(
  schema: ObjectSchema<TValues>,
  defaultValues: DefaultValues<TValues>,
) {
  return function useFormHook(extraContext?: TExtraContext) {
    return useAppForm(schema, defaultValues, extraContext);
  };
}
