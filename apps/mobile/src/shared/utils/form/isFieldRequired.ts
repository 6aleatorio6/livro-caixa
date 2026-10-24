import { getIn, ValidationError, type AnyObjectSchema, type Schema, type ValidateOptions } from 'yup';

function emptyValueOf(value: unknown) {
  if (typeof value === 'string') return '';
  if (Array.isArray(value)) return [];
  if (typeof value === 'boolean') return false;
  return value === null ? null : undefined;
}

/**
 * Um campo é obrigatório quando o schema recusa o valor vazio dele com os valores atuais do
 * formulário: vale para `.required()`, para um `.test()` próprio e para um `.when()` que depende de
 * outro campo, também dentro de objetos e listas. A forma vem do projeto-b.
 */
export function isFieldRequired(schema: AnyObjectSchema, values: object, name: string) {
  let resolved: ReturnType<typeof getIn>;
  try {
    resolved = getIn(schema, name, values);
  } catch {
    // Um caminho que o schema não tem com estes valores: um bloco que o `.when()` desligou.
    return false;
  }

  const field = resolved.schema as Schema;
  const parent = resolved.parent as Record<string, unknown> | undefined;

  // O mesmo que o `validateSyncAt` faz por dentro, mas com o campo vazio no lugar do valor: assim
  // não é preciso copiar os valores do formulário.
  try {
    field.validateSync(emptyValueOf(parent?.[resolved.parentPath]), { parent, path: name } as ValidateOptions);
    return false;
  } catch (error) {
    if (error instanceof ValidationError) return true;
    // Um teste assíncrono faz o `validateSync` lançar outro erro: sobe, para não ficar escondido.
    throw error;
  }
}
