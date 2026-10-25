import { yupResolver } from '@hookform/resolvers/yup';
import { type DefaultValues, type FieldValues, type Resolver, type UseFormReturn, useForm } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

import type { IAppFormContext } from '@/shared/types/form/AppFormContext';
import { isFieldRequired } from '@/shared/utils/form/isFieldRequired';

/**
 * O formulário ligado ao schema. Valida ao sair do campo e, depois disso, a cada mudança, para o
 * erro não aparecer antes de a pessoa terminar de digitar. O `context` leva a pergunta "este campo
 * é obrigatório?", que os campos ligados ao formulário fazem pelo `control`. O `extraContext` leva
 * o que uma regra do schema precisa saber de fora (a lista contra a qual um e-mail se compara) e
 * chega ao `.test()` em `this.options.context`.
 */
export function useAppForm<TValues extends FieldValues, TExtraContext extends object = object>(
  schema: ObjectSchema<TValues>,
  defaultValues: DefaultValues<TValues>,
  extraContext?: TExtraContext,
): UseFormReturn<TValues, IAppFormContext & TExtraContext> {
  type IContext = IAppFormContext & TExtraContext;
  const form: UseFormReturn<TValues, IContext> = useForm<TValues, IContext>({
    // O resolvedor tipa os valores pelo que o Yup infere (campos opcionais viram `?`), e não pelo
    // genérico do formulário: os valores são os mesmos.
    resolver: yupResolver(schema) as unknown as Resolver<TValues, IContext>,
    defaultValues,
    mode: 'onTouched',
    context: {
      ...(extraContext as TExtraContext),
      isFieldRequired: (name, values = form.getValues()) => isFieldRequired(schema, values, name),
    },
  });
  return form;
}
