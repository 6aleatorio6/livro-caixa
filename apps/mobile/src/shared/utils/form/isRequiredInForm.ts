import type { Control, FieldValues } from 'react-hook-form';

import type { IAppFormContext } from '@/shared/types/form/AppFormContext';

/**
 * Se o schema do formulário exige o campo, pela pergunta que o `useAppForm` pôs no `context`. O
 * react-hook-form guarda esse `context` em `control._options.context`.
 */
export function isRequiredInForm<TValues extends FieldValues>(
  control: Control<TValues>,
  name: string,
  values?: object,
) {
  return (control._options.context as IAppFormContext | undefined)?.isFieldRequired(name, values) ?? false;
}
