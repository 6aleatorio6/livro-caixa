import { type Control, type FieldValues, type Path, useWatch } from 'react-hook-form';

import { RequiredMark } from '@/shared/components/inputs/RequiredMark/RequiredMark';
import { isRequiredInForm } from '@/shared/utils/form/isRequiredInForm';

export interface ISmartRequiredMarkProps<TValues extends FieldValues> {
  control: Control<TValues>;
  /** O `*` aparece quando o schema exige algum destes campos. */
  names: Path<TValues>[];
}

/**
 * A marca de obrigatório de um rótulo que vale para um grupo de campos. Vigia o formulário todo,
 * porque o que torna o grupo obrigatório pode ser outro campo, e pergunta com os valores vigiados:
 * sem eles, o React Compiler guardaria a primeira resposta.
 */
export function SmartRequiredMark<TValues extends FieldValues>({ control, names }: ISmartRequiredMarkProps<TValues>) {
  const isRequired = useWatch({
    control,
    compute: (values) => names.some((name) => isRequiredInForm(control, name, values)),
  });

  return isRequired ? <RequiredMark /> : null;
}
