import { formatCents } from '@/shared/utils/format/formatCents';

import type { IInputMinimalProps } from '@/shared/types/form/InputMinimalProps';

import { type ITextFieldProps, TextField } from '@/shared/components/inputs/TextField/TextField';

// Até R$ 9.999.999,99: o que passa disso é erro de digitação.
const MAX_CENTS = 999_999_999;

export interface IMoneyFieldProps
  extends IInputMinimalProps<number | null>, Pick<ITextFieldProps, 'label' | 'supportText' | 'surfaceColor'> {}

/**
 * Campo de valor em reais, guardado em centavos (`null` é o campo vazio). Cada dígito entra pela direita
 * ("1" vira R$ 0,01; "12000" vira R$ 120,00) e apagar tira o último; o cursor fica sempre no fim.
 * O valor é sempre o dos dígitos do texto que o teclado entrega.
 */
export function MoneyField({ value, onValueChange, ...fieldProps }: IMoneyFieldProps) {
  const text = value === null ? '' : formatCents(value);

  const handleChangeText = (nextText: string) => {
    // O valor sai dos dígitos do texto novo: o teclado entrega "R$ 85,0" ao apagar e "R$ 85,001" ao
    // digitar, e selecionar tudo e digitar "5" entrega "5". Sem dígito, ou ao apagar até sobrar só
    // zero, o campo fica vazio; digitar "0" num campo vazio dá R$ 0,00, que o formulário recusa.
    const digits = nextText.replace(/\D/g, '');
    const cents = Number(digits);
    if (digits === '' || (cents === 0 && nextText.length < text.length)) {
      onValueChange(null);
      return;
    }
    if (cents <= MAX_CENTS) onValueChange(cents);
  };

  return (
    <TextField
      {...fieldProps}
      value={text}
      onValueChange={handleChangeText}
      keyboardType="number-pad"
      selection={{ start: text.length, end: text.length }}
    />
  );
}
