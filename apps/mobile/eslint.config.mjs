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
 * web de um projeto anterior, ajustada ao React Native e ao expo-router. O porquê de cada uma está nas regras do
 * repositório (.claude/rules/) e na skill project-structure.
 */

// ---------------------------------------------------------------------------
// Camadas, como no app anterior: src/app (rotas) → src/features → src/shared → src/core.
// ---------------------------------------------------------------------------

const elements = [
  { type: 'app', pattern: 'src/app' },
  { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
  { type: 'shared', pattern: 'src/shared' },
  { type: 'core', pattern: 'src/core' },
];

const sameFeature = { element: { type: 'feature', captured: { feature: '{{ from.element.captured.feature }}' } } };

/** O que cada camada pode importar: nenhuma conhece a de cima, e uma feature não importa outra. */
const layerPolicies = [
  { from: { element: { type: 'app' } }, allow: { to: { element: { type: ['app', 'feature', 'shared', 'core'] } } } },
  { from: { element: { type: 'feature' } }, allow: { to: [sameFeature, { element: { type: ['shared', 'core'] } }] } },
  { from: { element: { type: 'shared' } }, allow: { to: { element: { type: ['shared', 'core'] } } } },
  { from: { element: { type: 'core' } }, allow: { to: { element: { type: 'core' } } } },
];

/** O que não é código do app: os testes, o que os monta e os cenários dos serviços. */
const NOT_APP_CODE = ['src/**/*.test.{ts,tsx}', 'src/shared/testing/**', 'src/**/*.scenarios.ts'];

/** Qualquer arquivo de teste: o que ele importa não é cobrado como o código do app. */
const TEST_FILES = { file: { categories: { anyOf: ['test', 'testing'] } } };

const USE_SERVICE_QUERY =
  'Página e componente não importam o serviço: a leitura vem de um *QueryService, e a escrita, de uma ação (utils/actions/do*.ts).';

/**
 * Pacotes que só alguns arquivos importam. Entra aqui o pacote que tem um lugar certo: a mensagem diz
 * o que usar no lugar. Vêm depois das camadas porque a última política que casa decide: a primeira
 * proíbe o pacote de qualquer arquivo e a segunda devolve a permissão a quem pode.
 */
const restrictedPackage = (packages, message, allowedFrom) => {
  const modules = packages.map((pack) => ({
    origin: 'external',
    ...(typeof pack === 'string' ? { source: pack } : pack),
  }));
  return [
    { disallow: { to: { module: modules } }, message },
    ...(allowedFrom ? [{ from: allowedFrom, allow: { to: { module: modules } } }] : []),
  ];
};

const packagePolicies = [
  // Todo pacote está liberado, menos os da tabela abaixo.
  { allow: { to: { module: { origin: ['external', 'core'] } } } },
  ...restrictedPackage(
    ['@react-native-firebase/*'],
    'O Firebase só entra em src/shared (os serviços e os tipos): a tela chama um serviço.',
    [{ file: { path: 'src/shared/**' } }, { file: { categories: 'test' } }],
  ),
  ...restrictedPackage(
    // `source` é só o nome do pacote: o subcaminho do expo-router vai em `internalPath`.
    ['firebase', '@firebase/*', '@testing-library/*', { source: 'expo-router', internalPath: 'testing-library' }],
    'Pacote de teste: só um teste ou src/shared/testing o importa.',
    TEST_FILES,
  ),
  ...restrictedPackage(['zustand'], 'O zustand só entra num arquivo <nome>.store.ts: a tela usa o hook da store.', {
    file: { path: '**/*.store.ts' },
  }),
  ...restrictedPackage(
    ['@hookform/resolvers'],
    'O resolver do Yup só entra no useAppForm: o formulário usa o useAppForm.',
    { file: { path: 'src/shared/hooks/useAppForm/useAppForm.ts' } },
  ),
  ...restrictedPackage(
    ['react-native-safe-area-context', '@expo/vector-icons'],
    'Pacote sem uso no app: as margens vêm de rt.insets e os ícones, do Lucide.',
  ),
];

/** Quem importa o quê entre as pastas, além das camadas. Vem depois delas e dos pacotes, pelo mesmo motivo. */
const SCREEN_FILES = { file: { path: 'src/**/{pages,components}/**/*.tsx' } };
const folderPolicies = [
  // Só o `.tsx` da tela e do componente: as ações (`do*.ts`) e os hooks da pasta da página chamam o serviço.
  {
    from: SCREEN_FILES,
    disallow: { to: { file: { path: 'src/shared/services/**/*Service.ts' } } },
    message: USE_SERVICE_QUERY,
  },
  { from: SCREEN_FILES, allow: { to: { file: { path: 'src/shared/services/**/*QueryService.ts' } } } },
  // O teste (que também é `.tsx`) importa o serviço que ele simula e os cenários dele.
  { from: { file: { categories: 'test' } }, allow: { to: { file: { path: 'src/shared/services/**' } } } },
  {
    disallow: { to: { file: { path: 'src/core/store/**' } } },
    message: 'As stores de src/core/store só são importadas de src/core e dos testes.',
  },
  {
    from: [{ file: { path: 'src/core/**' } }, { file: { categories: 'test' } }],
    allow: { to: { file: { path: 'src/core/store/**' } } },
  },
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
    message: 'Cor só vem do tema (src/core/theme).',
  },
  { selector: 'Literal[value=/^(?:rgb|hsl)a?\\(/]', message: 'Cor só vem do tema (src/core/theme).' },
];

// ---------------------------------------------------------------------------
// Nomes proibidos de importar e `../` de mais de um nível. A lista é uma só: o arquivo que é o lugar
// certo de um nome o tira dela (`restrictedImports`), em vez de levar uma supressão.
// ---------------------------------------------------------------------------

const RESTRICTED_NAMES = [
  { name: 'react-native', importNames: ['StyleSheet'], message: 'Use o StyleSheet do react-native-unistyles.' },
  { name: 'react-native', importNames: ['Text'], message: 'Use o AppText.' },
  {
    name: 'react-native',
    importNames: ['SafeAreaView'],
    message: 'As margens vêm de rt.insets, como no Screen.',
  },
  ...['useMemo', 'useCallback', 'memo', 'forwardRef'].map((importName) => ({
    name: 'react',
    importNames: [importName],
    message: `O React Compiler está ligado (e o ref é prop): sem ${importName}. Um caso medido leva supressão com o motivo.`,
  })),
  { name: 'react-hook-form', importNames: ['useForm'], message: 'Use o useAppForm.' },
  ...['Controller', 'useController'].map((importName) => ({
    name: 'react-hook-form',
    importNames: [importName],
    message: 'Use o createInputSmartWrapper.',
  })),
];

const TWO_LEVELS_UP = { regex: '^\\.\\./\\.\\./', message: 'Mais de um `../`: use o caminho com `@/`.' };

/** A lista de nomes proibidos sem os do arquivo que é o lugar certo deles. */
function restrictedImports(...exceptions) {
  return [
    'error',
    {
      paths: RESTRICTED_NAMES.filter(({ name, importNames }) => !exceptions.includes(`${name}:${importNames[0]}`)),
      patterns: [TWO_LEVELS_UP],
    },
  ];
}

// ---------------------------------------------------------------------------
// Um arquivo, uma declaração exportada (.claude/rules/one-export-per-file.md).
//
// Conta função, classe, interface, tipo, enum e a constante que guarda função (hook, componente).
// Constante de valor não conta, e o que não é exportado também não. A mesma regra está no ESLint
// de um projeto anterior.
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

  // Nomes: prefixo I em tipos e T em genéricos, e booleano com prefixo. Este reconhece o booleano
  // pelo tipo, por isso o lint de src/ lê os tipos do projeto.
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
  // Arquivos e pastas como no app anterior: o arquivo leva o nome do que exporta, sem hífen. Componente,
  // página e tipo em PascalCase (`Button.tsx`, `SignInPage.tsx`, `RealtimeState.ts`); hook, função e
  // serviço em camelCase (`useRealtime.ts`, `createAsyncAction.ts`). As rotas seguem os nomes do
  // expo-router (`_layout`, `[id]`, `(auth)`, `+not-found`).
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**'],
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/*.{ts,tsx}': '+([a-zA-Z0-9])',
          'src/**/{components,pages}/**/*.tsx': 'PASCAL_CASE',
          'src/**/types/**/*.ts': 'PASCAL_CASE',
          'src/**/{hooks,services,utils,store}/**/*.ts': 'CAMEL_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
      // A pasta não tem hífen, e a de um grupo de rotas é `(PascalCase)` (skill project-structure). A
      // de um componente ou de uma página leva o nome dele, o que o check-file não consegue cobrar
      // sem cobrar também as pastas acima.
      'check-file/folder-naming-convention': ['error', { 'src/!(app)/**/': '@(+([a-zA-Z0-9])|\\(+([a-zA-Z0-9])\\))' }],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...NO_LITERAL_COLOR] },
  },
  // O tema é onde as cores literais moram, e o aumento de tipo do Unistyles (`interface
  // UnistylesThemes`) precisa repetir o nome dele, sem o prefixo I.
  {
    files: ['src/core/theme/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...NO_DEFAULT_EXPORT],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // Nomes proibidos: testes, o que só monta teste e os arquivos que são o lugar certo do nome ficam de fora do
  // primeiro bloco, e cada um desses tem o seu, com a lista sem o nome que ele guarda.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      ...NOT_APP_CODE,
      'src/shared/components/AppText/AppText.tsx',
      'src/core/**',
      'src/shared/utils/form/createInputSmartWrapper.tsx',
      'src/shared/hooks/useAppForm/useAppForm.ts',
    ],
    rules: { 'no-restricted-imports': restrictedImports() },
  },
  {
    files: ['src/shared/components/AppText/AppText.tsx', 'src/core/**/*.{ts,tsx}'],
    ignores: NOT_APP_CODE,
    rules: { 'no-restricted-imports': restrictedImports('react-native:Text') },
  },
  {
    files: ['src/shared/utils/form/createInputSmartWrapper.tsx'],
    rules: {
      'no-restricted-imports': restrictedImports('react-hook-form:Controller', 'react-hook-form:useController'),
    },
  },
  {
    files: ['src/shared/hooks/useAppForm/useAppForm.ts'],
    rules: { 'no-restricted-imports': restrictedImports('react-hook-form:useForm') },
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
      'boundaries/files': [
        { pattern: '**/*.test.{ts,tsx}', category: 'test' },
        { pattern: 'src/shared/testing/**', category: 'testing' },
        { pattern: '**/*.scenarios.ts', category: 'testing' },
      ],
      'boundaries/include': ['src/**/*'],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          checkAllOrigins: true,
          message:
            '{{from.element.types}} {{from.element.captured.feature}} não pode importar "{{dependency.source}}": nenhuma camada conhece a de cima, e uma feature não importa outra.',
          policies: [...layerPolicies, ...packagePolicies, ...folderPolicies],
        },
      ],
      'import-x/no-cycle': 'error',
    },
  },
]);
