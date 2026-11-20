/*
 * A regra local `naming/type-prefix`: os prefixos de tipo (skill project-structure e
 * .claude/rules/self-explaining-code.md), conferidos só pelo que a sintaxe mostra, sem tipos.
 *
 * - `interface` e `type` levam o prefixo `I`, e o resto do nome é PascalCase. O `I` separa o tipo
 *   do componente React.
 * - O parâmetro de tipo leva o prefixo `T`, e o resto é PascalCase.
 *
 * Só sintaxe TypeScript apagável: o Node tira os tipos sem compilar.
 */

type AstNode = any;

/** Primeira letra maiúscula e sem sublinhado. Vazio vale: o `T` sozinho passa. */
function isPascalCase(name: string): boolean {
  return name.length === 0 || (name[0] === name[0].toUpperCase() && !name.includes('_'));
}

function hasPrefix(name: string, prefix: string): boolean {
  return name.startsWith(prefix) && isPascalCase(name.slice(prefix.length));
}

/**
 * O tipo dentro de `declare module` ou `declare global` aumenta o tipo de uma biblioteca e repete o nome
 * dela, como o `UnistylesThemes` do tema.
 */
function isLibraryAugmentation(node: AstNode): boolean {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.type === 'TSModuleDeclaration' && (ancestor.declare || ancestor.kind === 'global')) return true;
  }
  return false;
}

export default {
  meta: { name: 'naming' },
  rules: {
    'type-prefix': {
      meta: {
        type: 'problem',
        docs: { description: 'Interface e tipo levam o prefixo I; parâmetro de tipo leva T.' },
        schema: [],
      },
      create(context: AstNode) {
        function checkDeclaration(declaration: AstNode) {
          const name: string = declaration.id.name;
          if (hasPrefix(name, 'I') || isLibraryAugmentation(declaration)) return;
          context.report({
            node: declaration.id,
            message: `"${name}": interface e tipo levam o prefixo I, seguido de PascalCase — "I${name[0].toUpperCase()}${name.slice(1)}".`,
          });
        }

        return {
          TSInterfaceDeclaration: checkDeclaration,
          TSTypeAliasDeclaration: checkDeclaration,
          TSTypeParameter(node: AstNode) {
            // Só o parâmetro declarado entre `<…>`, como o seletor `typeParameter` do `naming-convention`:
            // o `infer U` do tipo condicional fica de fora.
            if (node.parent.type !== 'TSTypeParameterDeclaration') return;
            const name: string = node.name.name;
            if (hasPrefix(name, 'T')) return;
            context.report({
              node: node.name,
              message: `"${name}": o parâmetro de tipo leva o prefixo T, seguido de PascalCase — TValues, TData.`,
            });
          },
        };
      },
    },
  },
};
