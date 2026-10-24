import { yupResolver } from '@hookform/resolvers/yup';
import { type DefaultValues, type FieldValues, type Resolver, useForm } from 'react-hook-form';
import type { ObjectSchema } from 'yup';

import type { IAppForm } from './app-form';
import { requiredFieldNames } from './required-field-names';

/**
 * O formulário ligado ao schema. Valida ao sair do campo e, depois disso, a cada mudança, para o
 * erro não aparecer antes de a pessoa terminar de digitar.
 */
export function useAppForm<TValues extends FieldValues>(
  schema: ObjectSchema<TValues>,
  defaultValues: DefaultValues<TValues>,
): IAppForm<TValues> {
  const form = useForm<TValues>({
    // O resolvedor tipa os valores pelo que o Yup infere (campos opcionais viram `?`), e não pelo
    // genérico do formulário: os valores são os mesmos.
    resolver: yupResolver(schema) as unknown as Resolver<TValues>,
    defaultValues,
    mode: 'onTouched',
  });
  return { ...form, requiredFieldNames: requiredFieldNames(schema) };
}
