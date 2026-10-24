import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import checkFile from 'eslint-plugin-check-file';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/*
 * As convenções do código moram aqui, e não só em Markdown: cada regra abaixo vem do ESLint do
 * web do projeto-a, ajustada ao React Native e ao expo-router. O porquê de cada uma está nas regras do
 * repositório (.claude/rules/) e na skill project-structure.
 */

// ---------------------------------------------------------------------------
// Camadas: src/app (rotas) → src/core (raiz de composição) → src/modules → src/shared.
// ---------------------------------------------------------------------------

const elements = [
  { type: 'app', pattern: 'src/app' },
  { type: 'core', pattern: 'src/core' },
  { type: 'module', pattern: 'src/modules/*', capture: ['module'] },
  { type: 'shared', pattern: 'src/shared' },
];

const sameModule = { element: { type: 'module', captured: { module: '{{ from.element.captured.module }}' } } };

/** O que cada camada pode importar: `shared` não conhece nada acima dele. */
const layerPolicies = [
  { from: { element: { type: 'app' } }, allow: { to: { element: { type: ['app', 'core', 'module', 'shared'] } } } },
  { from: { element: { type: 'core' } }, allow: { to: { element: { type: ['core', 'module', 'shared'] } } } },
  { from: { element: { type: 'module' } }, allow: { to: [sameModule, { element: { type: 'shared' } }] } },
  { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
];

// ---------------------------------------------------------------------------
// Booleano com prefixo. Fica de fora a prop que o componente repassa direto ao React Native: quem
// lê o JSX procura o nome dele. Prop nova desse tipo entra aqui, no mesmo commit.
// ---------------------------------------------------------------------------

const LIBRARY_BOOLEAN_PROPS = [
  'accessible',
  'autoFocus',
  'disabled',
  'editable',
  'focused',
  'horizontal',
  'hovered',
  'multiline',
  'pressed',
  'refreshing',
  'scrollEnabled',
  'secureTextEntry',
  'selectable',
  'transparent',
  'visible',
];

// ---------------------------------------------------------------------------
// Sintaxe proibida: export default (fora das rotas, que o expo-router exige) e cor literal.
// ---------------------------------------------------------------------------

const NO_DEFAULT_EXPORT = [
  { selector: 'ExportDefaultDeclaration', message: 'Use export nomeado: só as rotas de src/app exportam default.' },
  {
    selector: "ExportSpecifier[exported.name='default']",
    message: 'Use export nomeado: só as rotas de src/app exportam default.',
  },
];
const NO_LITERAL_COLOR = [
  {
    selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
    message: 'Cor só vem do tema (src/shared/theme).',
  },
  { selector: 'Literal[value=/^(?:rgb|hsl)a?\\(/]', message: 'Cor só vem do tema (src/shared/theme).' },
];

// ---------------------------------------------------------------------------
// Um arquivo, uma declaração exportada (.claude/rules/one-export-per-file.md).
//
// Conta função, classe, interface, tipo, enum e a constante que guarda função (hook, componente).
// Constante de valor não conta, e o que não é exportado também não. A mesma regra está no ESLint
// do projeto-a.
// ---------------------------------------------------------------------------

/** A constante guarda uma função — `const useToastStore = create(…)`, `const Screen = memo(…)`. */
function holdsFunction(declarator) {
  let init = declarator.init;
  while (init && (init.type === 'TSAsExpression' || init.type === 'TSSatisfiesExpression')) init = init.expression;
  if (!init || declarator.id.type !== 'Identifier') return false;
  if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') return true;
  return init.type === 'CallExpression' && /^(use[A-Z]|[A-Z][a-z])/.test(declarator.id.name);
}

/** As declarações exportadas que contam, com o nó onde o erro aparece. */
function exportedDeclarations(program) {
  const found = [];
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.source) continue;
    const declaration = statement.declaration;
    if (!declaration) {
      for (const specifier of statement.specifiers) found.push({ name: specifier.exported.name, node: specifier });
    } else if (declaration.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (holdsFunction(declarator)) found.push({ name: declarator.id.name, node: declarator });
      }
    } else if (declaration.id) {
      found.push({ name: declaration.id.name, node: declaration });
    }
  }
  // A interface de props mora com o componente: `IButtonProps` ao lado de `Button`.
  const names = new Set(found.map(({ name }) => name));
  return found.filter(({ name }) => !(/^I.+Props$/.test(name) && names.has(name.slice(1, -'Props'.length))));
}

const oneExportPlugin = {
  rules: {
    'one-export-per-file': {
      meta: { type: 'problem', docs: { description: 'Um arquivo, uma declaração exportada.' }, schema: [] },
      create(context) {
        return {
          Program(program) {
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
  },
};

export default defineConfig([
  globalIgnores(['.expo', 'android', 'ios', 'node_modules', 'expo-env.d.ts']),
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { globals: { ...globals.browser, __DEV__: 'readonly' } },
  },
  {
    files: ['*.config.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },

  // Nomes: kebab-case em arquivos e pastas, prefixo I em tipos e T em genéricos, e booleano com
  // prefixo. Este reconhece o booleano pelo tipo, por isso o lint de src/ lê os tipos do projeto.
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    plugins: { 'check-file': checkFile },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: ['interface', 'typeAlias'], format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },
        {
          selector: ['typeProperty', 'parameter'],
          types: ['boolean'],
          filter: { regex: `^(${LIBRARY_BOOLEAN_PROPS.join('|')})$`, match: true },
          format: null,
        },
        {
          selector: ['variable', 'parameter', 'classProperty', 'typeProperty', 'accessor'],
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'has', 'can', 'should', 'was'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': ['error', ...NO_DEFAULT_EXPORT, ...NO_LITERAL_COLOR],
    },
  },
  // As rotas seguem os nomes do expo-router (`_layout`, `[id]`, `(auth)`, `+not-found`) e exportam
  // default; o resto de src/ é kebab-case.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**'],
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { 'src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { 'src/**/': 'KEBAB_CASE' }],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...NO_LITERAL_COLOR] },
  },
  // O tema é onde as cores literais moram, e o aumento de tipo do Unistyles (`interface
  // UnistylesThemes`) precisa repetir o nome dele, sem o prefixo I.
  {
    files: ['src/shared/theme/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...NO_DEFAULT_EXPORT],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // Um arquivo, uma declaração exportada. Teste fica de fora.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
    plugins: { exports: oneExportPlugin },
    rules: { 'exports/one-export-per-file': 'error' },
  },

  // Fronteiras entre as camadas e sem ciclo entre arquivos.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries, 'import-x': importX },
    settings: {
      ...importX.flatConfigs.typescript.settings,
      'import/resolver': { typescript: { alwaysTryTypes: true, project: './tsconfig.json' } },
      'import-x/resolver-next': [createTypeScriptImportResolver({ project: './tsconfig.json' })],
      'boundaries/elements': elements,
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '{{from.element.types}} {{from.element.captured.module}} não pode importar "{{dependency.source}}": shared não conhece camada acima, e um módulo não importa outro.',
          policies: layerPolicies,
        },
      ],
      'import-x/no-cycle': 'error',
    },
  },
]);
