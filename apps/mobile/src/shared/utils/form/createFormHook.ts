import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

import { useAppForm } from '@/shared/hooks/useAppForm/useAppForm';

/**
 * Fixa o schema e os valores iniciais de um formulário e devolve o hook da tela. O hook aceita, no
 * segundo argumento, valores iniciais da chamada, que se sobrepõem aos da fábrica: o formulário que
 * começa com um dado já existente (o nome atual de quem vai trocá-lo).
 */
export function createFormHook<TValues extends FieldValues, TExtraContext extends object = object>(
  schema: ObjectSchema<TValues>,
  defaultValues: DefaultValues<TValues>,
) {
  return function useFormHook(extraContext?: TExtraContext, initialValues?: DefaultValues<TValues>) {
    return useAppForm(schema, { ...defaultValues, ...initialValues }, extraContext);
  };
}
