import { yupResolver } from '@hookform/resolvers/yup';
import { type DefaultValues, type FieldValues, type Resolver, type UseFormReturn, useForm } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

import type { IAppFormContext } from '@/shared/types/form/AppFormContext';
import { isFieldRequired } from '@/shared/utils/form/isFieldRequired';

/**
 * O formulário ligado ao schema. Valida ao sair do campo e, depois disso, a cada mudança, para o
 * erro não aparecer antes de a pessoa terminar de digitar. O `context` leva a pergunta "este campo
 * é obrigatório?", que os campos ligados ao formulário fazem pelo `control`.
 */
export function useAppForm<TValues extends FieldValues>(
  schema: ObjectSchema<TValues>,
  defaultValues: DefaultValues<TValues>,
): UseFormReturn<TValues, IAppFormContext> {
  const form: UseFormReturn<TValues, IAppFormContext> = useForm<TValues, IAppFormContext>({
    // O resolvedor tipa os valores pelo que o Yup infere (campos opcionais viram `?`), e não pelo
    // genérico do formulário: os valores são os mesmos.
    resolver: yupResolver(schema) as unknown as Resolver<TValues, IAppFormContext>,
    defaultValues,
    mode: 'onTouched',
    context: {
      isFieldRequired: (name, values = form.getValues()) => isFieldRequired(schema, values, name),
    },
  });
  return form;
}
