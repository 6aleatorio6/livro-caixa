import type { AnyObjectSchema } from 'yup';

/** Os campos que o schema exige: é deles que os campos de tela tiram a marca de obrigatório. */
export function requiredFieldNames(schema: AnyObjectSchema): ReadonlySet<string> {
  const fields = schema.describe().fields;
  return new Set(Object.keys(fields).filter((name) => !('optional' in fields[name] && fields[name].optional)));
}
