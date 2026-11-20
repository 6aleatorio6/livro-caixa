import path from 'node:path';
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
// Sintaxe proibida. O `no-restricted-syntax` guarda uma lista só por arquivo (a do último override que
// casa), então cada override que mexe nele repete a lista inteira do seu arquivo.
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

// Espaçamento, raio e tipografia vêm do tema. O `0` e o `'auto'` não são medida do design.
const THEME_KEYS =
  'padding.*|margin.*|gap|rowGap|columnGap|borderRadius|border.*Radius|fontSize|lineHeight|letterSpacing|fontWeight|fontFamily';
const NO_LITERAL_THEME_VALUE = [
  {
    selector: `Property[key.name=/^(?:${THEME_KEYS})$/][value.type='Literal']:not([value.value=0]):not([value.value='auto'])`,
    message:
      'O valor vem do tema: theme.spacing (padding, margin, gap), theme.radii (raios) ou theme.typography (fonte). Um valor do design sem token leva supressão com o motivo.',
  },
];

// O Pressable é o que o leitor de tela anuncia: sem o papel e o rótulo ele é só "botão sem nome".
const NO_PRESSABLE_WITHOUT_ACCESSIBILITY = ['accessibilityRole', 'accessibilityLabel'].map((attribute) => ({
  selector: `JSXOpeningElement[name.name='Pressable']:not(:has(> JSXAttribute[name.name='${attribute}']))`,
  message: `O Pressable leva ${attribute} (skill component-guidelines).`,
}));

// O `*` de obrigatório pergunta ao schema a cada mudança do formulário, e só em modo síncrono
// (`isFieldRequired`, skill forms). Uma função `async` no `.test()` só quebra no uso.
const NO_ASYNC_SCHEMA_TEST = [
  {
    // A função passada solta (`.test(nome, mensagem, fn)`) e a da forma de objeto (`.test({ test: fn })`).
    selector: [
      "CallExpression[callee.property.name='test'] > :matches(ArrowFunctionExpression, FunctionExpression)[async=true]",
      "CallExpression[callee.property.name='test'] > ObjectExpression > Property[key.name='test'] > :matches(ArrowFunctionExpression, FunctionExpression)[async=true]",
    ].join(', '),
    message:
      'O .test() do schema é síncrono: o isFieldRequired valida em modo síncrono, e o que só o servidor sabe chega no envio como erro de campo (skill forms).',
  },
];

// A rota só reexporta a página: `export { XPage as default } from '@/features/…'`. O `_layout` e os `+*`
// (`+not-found`, `+html`) montam a navegação e ficam de fora.
const ONLY_ROUTE_REEXPORT = [
  {
    selector: "Program > :not(ExportNamedDeclaration[source.value=/^@.features./]:has(> ExportSpecifier[exported.name='default']))",
    message:
      "A rota só reexporta a página: export { XPage as default } from '@/features/…' (skill project-structure).",
  },
];

// Todo mock de teste tem fábrica, e o que se espera da tela é `toBeOnTheScreen` (skill testing).
const TEST_SYNTAX = [
  {
    selector: "CallExpression[callee.object.name='jest'][callee.property.name='mock'][arguments.length=1]",
    message: 'Todo jest.mock tem fábrica: jest.mock(caminho, () => ({ … })) (skill testing).',
  },
  {
    selector: 'CallExpression[callee.property.name=/^(?:toBeTruthy|toBeFalsy)$/]',
    message: 'Use toBeOnTheScreen (ou o matcher que diz o que se espera), não toBeTruthy nem toBeFalsy (skill testing).',
  },
];

/** O que vale em todo arquivo de src/, fora o que cada pasta decide por si (export default, tema, rota). */
const SYNTAX_EVERYWHERE = [...NO_PRESSABLE_WITHOUT_ACCESSIBILITY, ...NO_ASYNC_SCHEMA_TEST];

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

/** Toda declaração exportada do arquivo, a constante de valor incluída, com o nó do erro e o tipo dele. */
function allExportedDeclarations(program) {
  const found = [];
  for (const statement of program.body) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.source) continue;
    const declaration = statement.declaration;
    if (!declaration) {
      for (const specifier of statement.specifiers) found.push({ name: specifier.exported.name, node: specifier });
    } else if (declaration.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (declarator.id.type === 'Identifier') found.push({ name: declarator.id.name, node: declarator });
      }
    } else if (declaration.id?.type === 'Identifier') {
      found.push({ name: declaration.id.name, node: declaration, kind: declaration.type });
    }
  }
  return found;
}

const comparable = (name) => name.toLowerCase().replaceAll('_', '');

/** Os nomes que o arquivo aceita: o dele, o `I<Nome>` do tipo e o `use<Nome>Store` de `<nome>.store.ts`. */
function acceptedNames(filename) {
  const base = path.basename(filename);
  const stem = base.slice(0, base.indexOf('.'));
  const names = [stem, `I${stem}`];
  if (base.endsWith('.store.ts')) names.push(`use${stem}Store`);
  return names.map(comparable);
}

/** Os nomes das constantes de topo do arquivo, exportadas ou não. */
function topLevelConstNames(program) {
  const names = new Set();
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
function usesTypeofOf(node, constants) {
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

const exportsPlugin = {
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
    'name-matches-file': {
      meta: { type: 'problem', docs: { description: 'Uma declaração exportada leva o nome do arquivo.' }, schema: [] },
      create(context) {
        return {
          Program(program) {
            const found = exportedDeclarations(program);
            if (found.length === 0) return;
            const accepted = acceptedNames(context.filename);
            if (found.some(({ name }) => accepted.includes(comparable(name)))) return;
            const stem = path.basename(context.filename).split('.')[0];
            context.report({
              node: found[0].node,
              message: `O arquivo exporta ${found.map(({ name }) => `"${name}"`).join(', ')}, e nenhum leva o nome dele ("${stem}"): renomeie o arquivo ou a declaração.`,
            });
          },
        };
      },
    },
    'type-in-types-folder': {
      meta: { type: 'problem', docs: { description: 'Tipo exportado mora numa pasta types/.' }, schema: [] },
      create(context) {
        const inTypesFolder = path.relative(context.cwd, context.filename).split(path.sep).includes('types');
        return {
          Program(program) {
            if (inTypesFolder) return;
            const exportedNames = new Set(allExportedDeclarations(program).map(({ name }) => name));
            const constants = topLevelConstNames(program);
            for (const { name, node, kind } of allExportedDeclarations(program)) {
              if (kind !== 'TSInterfaceDeclaration' && kind !== 'TSTypeAliasDeclaration') continue;
              const props = /^I(.+)Props$/.exec(name);
              if (props && exportedNames.has(props[1])) continue;
              if (usesTypeofOf(node, constants)) continue;
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
      'no-restricted-syntax': [
        'error',
        ...NO_DEFAULT_EXPORT,
        ...NO_LITERAL_COLOR,
        ...NO_LITERAL_THEME_VALUE,
        ...SYNTAX_EVERYWHERE,
      ],
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
  // As rotas exportam default (o expo-router exige), e as que não são layout só reexportam a página.
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...NO_LITERAL_COLOR, ...NO_LITERAL_THEME_VALUE, ...SYNTAX_EVERYWHERE],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: ['src/app/**/_layout.tsx', 'src/app/**/+*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...NO_LITERAL_COLOR,
        ...NO_LITERAL_THEME_VALUE,
        ...SYNTAX_EVERYWHERE,
        ...ONLY_ROUTE_REEXPORT,
      ],
    },
  },
  // O tema é onde as cores e as medidas literais moram, e o aumento de tipo do Unistyles (`interface
  // UnistylesThemes`) precisa repetir o nome dele, sem o prefixo I.
  {
    files: ['src/core/theme/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...NO_DEFAULT_EXPORT, ...SYNTAX_EVERYWHERE],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // Os testes: as medidas do tema não valem neles, e as regras de mock e de matcher só valem neles. Os de
  // fora de src/ (`__tests__`, `jest.setup.ts`) só levam as de teste, como no resto do que não é do app.
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...NO_DEFAULT_EXPORT, ...NO_LITERAL_COLOR, ...SYNTAX_EVERYWHERE, ...TEST_SYNTAX],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'jest.setup.ts'],
    ignores: ['src/**'],
    rules: { 'no-restricted-syntax': ['error', ...TEST_SYNTAX] },
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
    plugins: { exports: exportsPlugin },
    rules: { 'exports/one-export-per-file': 'error' },
  },
  // O nome do arquivo e o lugar dos tipos. Ficam de fora as rotas (o nome é o do expo-router), os testes, o que só
  // monta teste e os cenários, que levam o nome do serviço.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**', ...NOT_APP_CODE, 'src/**/*.d.ts'],
    plugins: { exports: exportsPlugin },
    rules: { 'exports/name-matches-file': 'error', 'exports/type-in-types-folder': 'error' },
  },

  // Onde cada arquivo mora: o que o nome diz que é decide a pasta. O Metro empacota tudo o que está em
  // src/app como rota, então o teste da rota vai para `__tests__/app/`.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'check-file/folder-match-with-fex': [
        'error',
        {
          'use[A-Z]*.{ts,tsx}': '**/hooks/use*/',
          'do[A-Z]*.ts': '**/utils/actions/',
          '*QueryService.ts': 'src/shared/services/*/query/',
          '[a-z]*Service.ts': 'src/shared/services/**/',
          '*.scenarios.ts': 'src/shared/services/**/',
          '*.contract.test.ts': 'src/shared/services/**/',
          '*.store.ts': 'src/{core,shared}/store/',
        },
        { errorMessage: 'O arquivo "{{ target }}" mora em "{{ pattern }}" (skill project-structure).' },
      ],
      'check-file/filename-blocklist': [
        'error',
        { 'src/app/**/*.test.{ts,tsx}': '__tests__/app/' },
        {
          errorMessage:
            'O Metro empacotaria o teste "{{ target }}" como rota: o teste da rota vai para __tests__/app/.',
        },
      ],
    },
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
