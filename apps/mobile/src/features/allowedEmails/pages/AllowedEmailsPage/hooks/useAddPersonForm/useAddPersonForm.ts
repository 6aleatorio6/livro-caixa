import { object, string } from 'yup';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { createFormHook } from '@/shared/utils/form/createFormHook';

/** O que o formulário sabe de fora: a lista carregada, contra a qual o e-mail é comparado. */
interface IAddPersonContext {
  people: IAllowedEmailListItem[];
}

const addPersonSchema = object({
  name: string().trim().required(),
  email: string()
    .trim()
    .required()
    .email()
    .test('not-in-list', 'Este e-mail já está na lista.', function (value) {
      const people = (this.options.context as IAddPersonContext | undefined)?.people ?? [];
      const sameEmail = people.find((person) => person.email === allowedEmailId(value));
      return sameEmail
        ? this.createError({ message: `Este e-mail já está na lista, com o nome ${sameEmail.name}.` })
        : true;
    }),
});

export const useAddPersonForm = createFormHook<{ name: string; email: string }, IAddPersonContext>(addPersonSchema, {
  name: '',
  email: '',
});
