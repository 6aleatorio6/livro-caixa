/*
 * As regras locais `exports/*`: um arquivo, uma declaração exportada
 * (.claude/rules/one-export-per-file.md), o nome do arquivo e o lugar dos tipos (skill
 * project-structure).
 *
 * Só sintaxe TypeScript apagável (o Node tira os tipos sem compilar): sem `enum`, sem `namespace`,
 * sem propriedade de parâmetro. Os nós da AST são `any` porque a API de plugin ainda não publica
 * os tipos do ESTree.
 */

import path from 'node:path';

type AstNode = any;

// ---------------------------------------------------------------------------
// Um arquivo, uma declaração exportada (.claude/rules/one-export-per-file.md).
//
// Conta função, classe, interface, tipo, enum e a constante que guarda função (hook, componente).
// Constante de valor não conta, e o que não é exportado também não. O componente local, que vai
// para o próprio arquivo mesmo assim, esta regra não vê.
// ---------------------------------------------------------------------------

/** A constante guarda uma função — `const useToastStore = create(…)`, `const Screen = memo(…)`. */
function holdsFunction(declarator: AstNode): boolean {
  let init = declarator.init;
  while (init && (init.type === 'TSAsExpression' || init.type === 'TSSatisfiesExpression')) init = init.expression;
  if (!init || declarator.id.type !== 'Identifier') return false;
  if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') return true;
  return init.type === 'CallExpression' && /^(use[A-Z]|[A-Z][a-z])/.test(declarator.id.name);
}

/** As declarações exportadas que contam, com o nó onde o erro aparece. */
function exportedDeclarations(program: AstNode): { name: string; node: AstNode }[] {
  const found: { name: string; node: AstNode }[] = [];
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.source) continue;
    const declaration = statement.declaration;
    if (!declaration) {
      for (const specifier of statement.specifiers) found.push({ name: specifier.exported.name, node: specifier });
    } else if (declaration.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (holdsFunction(declarator)) found.push({ name: declarator.id.name, node: declarator });
      }
    } else if (declaration.id && !found.some(({ name }) => name === declaration.id.name)) {
      // As sobrecargas (`export function f(a: string): string;`) repetem o nome da função: contam uma vez.
      found.push({ name: declaration.id.name, node: declaration });
    }
  }
  // A interface de props mora com o componente: `IButtonProps` ao lado de `Button`.
  const names = new Set(found.map(({ name }) => name));
  return found.filter(({ name }) => !(/^I.+Props$/.test(name) && names.has(name.slice(1, -'Props'.length))));
}

const comparable = (name: string): string => name.toLowerCase().replaceAll('_', '');

/** O nome do arquivo até o primeiro ponto: `Button` de `Button.test.tsx`, `toast` de `toast.store.ts`. */
const fileStem = (filename: string): string => path.basename(filename).split('.')[0];

/** Os nomes que o arquivo aceita: o dele, o `I<Nome>` do tipo e o `use<Nome>Store` de `<nome>.store.ts`. */
function acceptedNames(filename: string): string[] {
  const stem = fileStem(filename);
  const names = [stem, `I${stem}`];
  if (filename.endsWith('.store.ts')) names.push(`use${stem}Store`);
  return names.map(comparable);
}

const isTypeDeclaration = (node: AstNode): boolean =>
  node?.type === 'TSInterfaceDeclaration' || node?.type === 'TSTypeAliasDeclaration';

/** As interfaces e os tipos do topo do arquivo, exportados ou não, pelo nome. */
function topLevelTypesByName(program: AstNode): Map<string, AstNode> {
  const typesByName = new Map<string, AstNode>();
  for (const statement of program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (isTypeDeclaration(declaration)) typesByName.set(declaration.id.name, declaration);
  }
  return typesByName;
}

function topLevelConstNames(program: AstNode): Set<string> {
  const names = new Set<string>();
  for (const statement of program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration' || declaration.kind !== 'const') continue;
    for (const declarator of declaration.declarations) {
      if (declarator.id.type === 'Identifier') names.add(declarator.id.name);
    }
  }
  return names;
}

/** O corpo do tipo tem `typeof` de uma das constantes (`(typeof ROLES)[number]`). */
function usesTypeofOf(node: AstNode, constants: Set<string>): boolean {
  if (!node || typeof node.type !== 'string') return false;
  if (node.type === 'TSTypeQuery') {
    let name = node.exprName;
    while (name.type === 'TSQualifiedName') name = name.left;
    if (constants.has(name.name)) return true;
  }
  return Object.entries(node).some(([key, child]) => {
    if (key === 'parent') return false;
    return Array.isArray(child) ? child.some((item) => usesTypeofOf(item, constants)) : usesTypeofOf(child, constants);
  });
}

export default {
  meta: { name: 'exports' },
  rules: {
    'one-export-per-file': {
      meta: { type: 'problem', docs: { description: 'Um arquivo, uma declaração exportada.' }, schema: [] },
      create(context: AstNode) {
        return {
          Program(program: AstNode) {
            const [first, ...others] = exportedDeclarations(program);
            for (const { name, node } of others) {
              context.report({
                node,
                message: `"${name}" vai para um arquivo próprio: este já exporta "${first.name}".`,
              });
            }
          },
        };
      },
    },
    'name-matches-file': {
      meta: { type: 'problem', docs: { description: 'Uma declaração exportada leva o nome do arquivo.' }, schema: [] },
      create(context: AstNode) {
        return {
          Program(program: AstNode) {
            const found = exportedDeclarations(program);
            if (found.length === 0) return;
            const accepted = acceptedNames(context.filename);
            if (found.some(({ name }) => accepted.includes(comparable(name)))) return;
            context.report({
              node: found[0].node,
              message: `O arquivo exporta ${found.map(({ name }) => `"${name}"`).join(', ')}, e nenhum leva o nome dele ("${fileStem(context.filename)}"): renomeie o arquivo ou a declaração.`,
            });
          },
        };
      },
    },
    'type-in-types-folder': {
      meta: { type: 'problem', docs: { description: 'Tipo exportado mora numa pasta types/.' }, schema: [] },
      create(context: AstNode) {
        const inTypesFolder = path.relative(context.cwd, context.filename).split(path.sep).includes('types');
        return {
          Program(program: AstNode) {
            if (inTypesFolder) return;
            // O `exportedDeclarations` já deixa de fora o `I<X>Props` do componente `X` exportado. A lista de exports
            // (`export type { IUser }`) aponta para a declaração do topo do arquivo.
            const typesByName = topLevelTypesByName(program);
            const types = exportedDeclarations(program)
              .map(({ name, node }) => ({
                name,
                node,
                declaration: node.type === 'ExportSpecifier' ? typesByName.get(node.local.name) : node,
              }))
              .filter(({ declaration }) => isTypeDeclaration(declaration));
            if (types.length === 0) return;
            const constants = topLevelConstNames(program);
            for (const { name, node, declaration } of types) {
              if (usesTypeofOf(declaration, constants)) continue;
              context.report({
                node,
                message: `O tipo "${name}" vai para uma pasta types/ (só o I<X>Props mora com o componente X, e o tipo derivado de uma constante do arquivo fica com ela).`,
              });
            }
          },
        };
      },
    },
  },
};
