import type { FieldValues, UseFormReturn } from 'react-hook-form';

/** O formulário do react-hook-form com os campos que o schema exige. */
export type IAppForm<TValues extends FieldValues> = UseFormReturn<TValues> & {
  requiredFieldNames: ReadonlySet<string>;
};
