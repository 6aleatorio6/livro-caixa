import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { type ITextFieldProps, TextField } from '@/shared/components/inputs/TextField/TextField';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { fromIsoDate } from '@/shared/utils/date/fromIsoDate';
import { toIsoDate } from '@/shared/utils/date/toIsoDate';

export interface IDateFieldProps
  extends IInputMinimalProps<string>, Pick<ITextFieldProps, 'label' | 'supportText' | 'surfaceColor'> {
  /** A última data que o calendário deixa escolher; sem ela, qualquer data. */
  maximumDate?: Date;
}

/**
 * Campo de data ('AAAA-MM-DD' ou vazio) que se escolhe no calendário do Android, aberto pelo toque no campo ou
 * no ícone. Só "OK" grava a data; cancelar não muda nada. O teclado não edita o campo.
 */
export function DateField({ value, onValueChange, onBlur, maximumDate, ...fieldProps }: IDateFieldProps) {
  const openCalendar = () => {
    DateTimePickerAndroid.open({
      value: value ? fromIsoDate(value) : new Date(),
      mode: 'date',
      maximumDate,
      onValueChange: (_event, date) => {
        onValueChange(toIsoDate(date));
        // Escolher a data é sair do campo: é quando a validação roda.
        onBlur();
      },
    });
  };

  return (
    <TextField
      {...fieldProps}
      value={value ? formatIsoDate(value) : ''}
      onValueChange={() => undefined}
      onBlur={onBlur}
      onPress={openCalendar}
      trailingIcon={Calendar}
    />
  );
}
