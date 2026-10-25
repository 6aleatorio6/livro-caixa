import { object, string } from 'yup';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { createFormHook } from '@/shared/utils/form/createFormHook';

/** O que o formulário sabe de fora: a lista carregada, contra a qual o e-mail é comparado. */
interface IAddPersonContext {
  people: IAllowedEmailListItem[];
}

const addPersonSchema = object({
  email: string()
    .trim()
    .required()
    .email()
    .test('not-in-list', 'Este e-mail já está na lista.', function (value) {
      const people = (this.options.context as IAddPersonContext | undefined)?.people ?? [];
      return !people.some((person) => person.email === allowedEmailId(value));
    }),
});

export const useAddPersonForm = createFormHook<{ email: string }, IAddPersonContext>(addPersonSchema, { email: '' });
