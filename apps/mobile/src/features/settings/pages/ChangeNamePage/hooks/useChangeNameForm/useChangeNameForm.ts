import { object, string } from 'yup';

import { createFormHook } from '@/shared/utils/form/createFormHook';

const changeNameSchema = object({
  name: string().trim().required().max(60),
});

/**
 * O formulário do nome. O nome atual entra como valor inicial na chamada, por isso o formulário só
 * nasce com a leitura do nome respondida.
 */
export const useChangeNameForm = createFormHook(changeNameSchema, { name: '' });
