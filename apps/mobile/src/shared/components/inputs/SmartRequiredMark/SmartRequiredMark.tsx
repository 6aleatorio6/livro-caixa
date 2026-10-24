import { type Control, type FieldValues, type Path, useWatch } from 'react-hook-form';

import { AppText } from '@/shared/components/AppText/AppText';
import { isRequiredInForm } from '@/shared/utils/form/isRequiredInForm';

export interface ISmartRequiredMarkProps<TValues extends FieldValues> {
  control: Control<TValues>;
  /** O `*` aparece quando o schema exige algum destes campos. */
  names: Path<TValues>[];
}

/**
 * A marca de obrigatório de um rótulo que vale para um grupo de campos. Vigia o formulário todo,
 * porque o que torna o grupo obrigatório pode ser outro campo, e pergunta com os valores vigiados:
 * sem eles, o React Compiler guardaria a primeira resposta. A forma vem do projeto-b.
 */
export function SmartRequiredMark<TValues extends FieldValues>({ control, names }: ISmartRequiredMarkProps<TValues>) {
  const isRequired = useWatch({
    control,
    compute: (values) => names.some((name) => isRequiredInForm(control, name, values)),
  });

  // O leitor de tela não lê o `*`: quem anuncia o obrigatório é o próprio campo.
  return isRequired ? (
    <AppText color="error" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      *
    </AppText>
  ) : null;
}
