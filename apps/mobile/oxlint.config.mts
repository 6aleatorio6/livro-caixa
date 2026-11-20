import { defineConfig } from 'oxlint';

/*
 * As convenções do código moram aqui, e não só em Markdown: cada regra abaixo vem do lint do web de um
 * projeto anterior, ajustada ao React Native e ao expo-router. O porquê de cada uma está nas regras do
 * repositório (.claude/rules/) e na skill project-structure.
 *
 * O Oxlint roda de dentro de apps/mobile (`pnpm --filter livro-caixa-mobile lint`): o check-file e o
 * boundaries medem o caminho do arquivo a partir do `cwd`, e rodado da raiz do repositório o lint de
 * arquitetura passa calado.
 *
 * Limites do Oxlint que moldam esta config:
 * - `settings` só existe na raiz, e passa por JSON: o resolvedor do boundaries é o `import/resolver`
 *   legado, e não o objeto do `createTypeScriptImportResolver`;
 * - JS plugin só entra por especificador: as regras escritas aqui moram em lint/, na raiz do repositório;
 * - o `no-restricted-syntax` guarda uma lista só por arquivo (a do último override que casa), então cada
 *   override que mexe nele repete a lista inteira do seu arquivo.
 */

// ---------------------------------------------------------------------------
// Presets: o Oxlint não tem `extends` de config do ESLint, então as regras dos presets recommended do
// ESLint, do typescript-eslint e do react-hooks 7 entram uma a uma.
// ---------------------------------------------------------------------------

/** O mapa de regras que o `defineConfig` aceita: o Oxlint não exporta o tipo com nome. */
type IRuleMap = NonNullable<Parameters<typeof defineConfig>[0]['rules']>;

const PRESET_RULES: IRuleMap = {
  // @eslint/js recommended, menos o que o eslint-recommended do typescript-eslint desliga em TS (essas voltam
  // para os arquivos .js e .mjs, abaixo). O `no-octal` e o `no-dupe-args` ficam de fora: o Oxlint não os tem, e o
  // parser já recusa, no módulo, o octal legado e o parâmetro repetido.
  'for-direction': 'error',
  'no-async-promise-executor': 'error',
  'no-case-declarations': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-constant-binary-expression': 'error',
  'no-constant-condition': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-else-if': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'error',
  'no-empty-character-class': 'error',
  'no-empty-pattern': 'error',
  'no-empty-static-block': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'error',
  'no-fallthrough': 'error',
  'no-global-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-prototype-builtins': 'error',
  'no-regex-spaces': 'error',
  'no-self-assign': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-unassigned-vars': 'error',
  'no-unexpected-multiline': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-optional-chaining': 'error',
  'no-unused-labels': 'error',
  'no-unused-private-class-members': 'error',
  // Nursery no Oxlint 1.94; ligada pelo nome, como no ESLint 10.
  'no-useless-assignment': 'error',
  'no-useless-backreference': 'error',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  'preserve-caught-error': 'error',
  'require-yield': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
  // O que o eslint-recommended do typescript-eslint liga em TS.
  'no-var': 'error',
  'prefer-const': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  // typescript-eslint recommended (sem tipos).
  'no-array-constructor': 'error',
  'no-unused-expressions': 'error',
  // Com objeto de opções, e não só 'error': sem ele, o Oxlint ignora `_x` (o ESLint não).
  'no-unused-vars': ['error', {}],
  'typescript/ban-ts-comment': 'error',
  'typescript/no-duplicate-enum-values': 'error',
  'typescript/no-empty-object-type': 'error',
  'typescript/no-explicit-any': 'error',
  'typescript/no-extra-non-null-assertion': 'error',
  'typescript/no-misused-new': 'error',
  'typescript/no-namespace': 'error',
  'typescript/no-non-null-asserted-optional-chain': 'error',
  'typescript/no-require-imports': 'error',
  'typescript/no-this-alias': 'error',
  'typescript/no-unnecessary-type-constraint': 'error',
  'typescript/no-unsafe-declaration-merging': 'error',
  'typescript/no-unsafe-function-type': 'error',
  'typescript/no-wrapper-object-types': 'error',
  'typescript/prefer-as-const': 'error',
  'typescript/prefer-namespace-keyword': 'error',
  'typescript/triple-slash-reference': 'error',
  // eslint-plugin-react-hooks 7 (recommended); as do React Compiler são experimentais no Oxlint. O
  // `react-hooks/config` e o `react-hooks/gating` ficam de fora: o Oxlint 1.94 não os tem, e só acusam opção
  // inválida do compilador e diretiva de gating dinâmico, que o app não usa.
  'react/rules-of-hooks': 'error',
  'react/exhaustive-deps': 'warn',
  'react/static-components': 'error',
  'react/use-memo': 'error',
  'react/preserve-manual-memoization': 'error',
  'react/incompatible-library': 'warn',
  'react/immutability': 'error',
  'react/globals': 'error',
  'react/refs': 'error',
  'react/set-state-in-effect': 'error',
  'react/error-boundaries': 'error',
  'react/purity': 'error',
  'react/set-state-in-render': 'error',
  'react/unsupported-syntax': 'warn',
};

/** O que o typescript-eslint desliga em TS porque o compilador confere, e que o .js e o .mjs continuam pedindo. */
const JS_ONLY_RULES: IRuleMap = {
  'constructor-super': 'error',
  'getter-return': 'error',
  'no-class-assign': 'error',
  'no-const-assign': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-keys': 'error',
  'no-func-assign': 'error',
  'no-import-assign': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-obj-calls': 'error',
  'no-redeclare': 'error',
  'no-setter-return': 'error',
  'no-this-before-super': 'error',
  'no-undef': 'error',
  'no-unreachable': 'error',
  'no-unsafe-negation': 'error',
  'no-with': 'error',
};

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

/**
 * O que não é código do app: os testes, o que os monta e os cenários dos serviços. O boundaries os lê
 * como categorias, e os overrides os tiram das regras que só valem para o app.
 */
const NOT_APP_CODE_FILES = [
  { pattern: '**/*.test.{ts,tsx}', category: 'test' },
  { pattern: 'src/shared/testing/**', category: 'testing' },
  { pattern: '**/*.scenarios.ts', category: 'testing' },
];
const NOT_APP_CODE = NOT_APP_CODE_FILES.map(({ pattern }) => pattern);

const TEST_FILE = { file: { categories: 'test' } };

type IModuleMatcher = string | { source: string; internalPath: string };

/**
 * Pacotes que só alguns arquivos importam. Entra aqui o pacote que tem um lugar certo: a mensagem diz
 * o que usar no lugar. Vêm depois das camadas porque a última política que casa decide: a primeira
 * proíbe o pacote de qualquer arquivo e a segunda devolve a permissão a quem pode.
 */
const restrictedPackage = (packages: IModuleMatcher[], message: string, allowedFrom?: object) => {
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
    [{ file: { path: 'src/shared/**' } }, TEST_FILE],
  ),
  ...restrictedPackage(
    // `source` é só o nome do pacote: o subcaminho do expo-router vai em `internalPath`.
    ['firebase', '@firebase/*', '@testing-library/*', { source: 'expo-router', internalPath: 'testing-library' }],
    'Pacote de teste: só um teste ou src/shared/testing o importa.',
    { file: { categories: { anyOf: ['test', 'testing'] } } },
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

/**
 * Quem importa o quê entre as pastas, além das camadas. Vem depois delas e dos pacotes, pelo mesmo motivo, e por isso
 * cada `allow` daqui vale só acima de src/core: senão devolveria ao core o shared que as camadas tiram dele.
 */
const ABOVE_CORE = { type: ['app', 'feature', 'shared'] };
const SCREEN_FILES = { element: ABOVE_CORE, file: { path: 'src/**/{pages,components}/**/*.tsx' } };
const folderPolicies = [
  // Só o `.tsx` da tela e do componente: as ações (`do*.ts`) e os hooks da pasta da página chamam o serviço.
  {
    from: SCREEN_FILES,
    disallow: { to: { file: { path: 'src/shared/services/**/*Service.ts' } } },
    message:
      'Página e componente não importam o serviço: a leitura vem de um *QueryService, e a escrita, de uma ação (utils/actions/do*.ts).',
  },
  { from: SCREEN_FILES, allow: { to: { file: { path: 'src/shared/services/**/*QueryService.ts' } } } },
  // O teste (que também é `.tsx`) importa o serviço que ele simula e os cenários dele.
  { from: { ...TEST_FILE, element: ABOVE_CORE }, allow: { to: { file: { path: 'src/shared/services/**' } } } },
  {
    disallow: { to: { file: { path: 'src/core/store/**' } } },
    message: 'As stores de src/core/store só são importadas de src/core e dos testes.',
  },
  { from: [{ file: { path: 'src/core/**' } }, TEST_FILE], allow: { to: { file: { path: 'src/core/store/**' } } } },
];

// ---------------------------------------------------------------------------
// Sintaxe proibida. Roda pelo `no-restricted-syntax` do ESLint, servido pelo pacote oficial
// oxlint-plugin-eslint (`eslint-js/no-restricted-syntax`).
// ---------------------------------------------------------------------------

const NO_LITERAL_COLOR = [
  {
    selector: [
      'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
      'Literal[value=/^(?:rgb|hsl)a?\\(/]',
    ].join(', '),
    message: 'Cor só vem do tema (src/core/theme).',
  },
];

// Espaçamento, raio e tipografia vêm do tema. O `0` e o `'auto'` não são medida do design.
const THEME_KEYS =
  'padding.*|margin.*|gap|rowGap|columnGap|borderRadius|border.*Radius|fontSize|lineHeight|letterSpacing|fontWeight|fontFamily';
const NO_LITERAL_THEME_VALUE = [
  {
    // O número negativo (`margin: -4`) é um `UnaryExpression` sobre o literal.
    selector: `Property[key.name=/^(?:${THEME_KEYS})$/]:matches([value.type='Literal'], [value.type='UnaryExpression'][value.argument.type='Literal']):not([value.value=0]):not([value.value='auto'])`,
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
    selector:
      "Program > :not(ExportNamedDeclaration[source.value=/^@.features./]:has(> ExportSpecifier[exported.name='default']))",
    message: "A rota só reexporta a página: export { XPage as default } from '@/features/…' (skill project-structure).",
  },
];

// Todo mock de teste tem fábrica (skill testing).
const TEST_SYNTAX = [
  {
    selector: "CallExpression[callee.object.name='jest'][callee.property.name='mock'][arguments.length=1]",
    message: 'Todo jest.mock tem fábrica: jest.mock(caminho, () => ({ … })) (skill testing).',
  },
];

/** O que vale em todo arquivo de src/, fora o que cada pasta decide por si (tema, rota). */
const SYNTAX_EVERYWHERE = [...NO_PRESSABLE_WITHOUT_ACCESSIBILITY, ...NO_ASYNC_SCHEMA_TEST];
const APP_SYNTAX = [...NO_LITERAL_COLOR, ...NO_LITERAL_THEME_VALUE, ...SYNTAX_EVERYWHERE];

const TRUTHY_MESSAGE = 'Use toBeOnTheScreen, ou o matcher que diz o que se espera (skill testing).';

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
function restrictedImports(...exceptions: string[]): NonNullable<IRuleMap['no-restricted-imports']> {
  return [
    'error',
    {
      paths: RESTRICTED_NAMES.filter(({ name, importNames }) => !exceptions.includes(`${name}:${importNames[0]}`)),
      patterns: [TWO_LEVELS_UP],
    },
  ];
}

export default defineConfig({
  plugins: ['typescript', 'react', 'import', 'jest'],
  categories: { correctness: 'off' },
  ignorePatterns: ['.expo', 'android', 'ios', 'node_modules', 'expo-env.d.ts'],
  options: { reportUnusedDisableDirectives: 'error' },
  env: { browser: true },
  globals: { __DEV__: 'readonly' },
  jsPlugins: [
    'eslint-plugin-check-file',
    'eslint-plugin-boundaries',
    { name: 'eslint-js', specifier: 'oxlint-plugin-eslint' },
    '../../lint/exports.ts',
    '../../lint/naming.ts',
  ],
  settings: {
    'import/resolver': { typescript: { project: './tsconfig.json' } },
    'boundaries/elements': elements,
    'boundaries/files': NOT_APP_CODE_FILES,
    'boundaries/include': ['src/**/*'],
  },
  overrides: [
    { files: ['**/*.{js,mjs,ts,mts,tsx}'], rules: PRESET_RULES },
    { files: ['**/*.{js,mjs}'], rules: JS_ONLY_RULES },
    { files: ['*.config.{js,mjs,ts,mts}'], env: { node: true } },

    // Nomes: prefixo I em tipos e T em genéricos. O prefixo de booleano não é conferido pelo lint: o
    // Oxlint não passa tipos a um JS plugin, e quem escreve e quem revisa o código o conferem. Só as rotas
    // exportam default, porque o expo-router exige.
    {
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        'naming/type-prefix': 'error',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'import/no-default-export': 'error',
        'eslint-js/no-restricted-syntax': ['error', ...APP_SYNTAX],
      },
    },
    // Arquivos e pastas como no app anterior: o arquivo leva o nome do que exporta, sem hífen. Componente,
    // página e tipo em PascalCase (`Button.tsx`, `SignInPage.tsx`, `RealtimeState.ts`); hook, função e
    // serviço em camelCase (`useRealtime.ts`, `createAsyncAction.ts`). As rotas seguem os nomes do
    // expo-router (`_layout`, `[id]`, `(auth)`, `+not-found`).
    {
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: ['src/app/**'],
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
        'check-file/folder-naming-convention': [
          'error',
          { 'src/!(app)/**/': '@(+([a-zA-Z0-9])|\\(+([a-zA-Z0-9])\\))' },
        ],
      },
    },
    // A rota exporta default, e a que não é layout só reexporta a página: o seletor dela já recusa qualquer
    // outra coisa no arquivo.
    { files: ['src/app/**/*.{ts,tsx}'], rules: { 'import/no-default-export': 'off' } },
    {
      files: ['src/app/**/*.{ts,tsx}'],
      excludeFiles: ['src/app/**/_layout.tsx', 'src/app/**/+*.tsx'],
      rules: { 'eslint-js/no-restricted-syntax': ['error', ...ONLY_ROUTE_REEXPORT] },
    },
    // O tema é onde as cores e as medidas literais moram.
    { files: ['src/core/theme/**/*.ts'], rules: { 'eslint-js/no-restricted-syntax': ['error', ...SYNTAX_EVERYWHERE] } },
    // O aumento de tipo do Unistyles (`interface UnistylesThemes extends IAppThemes {}`) é vazio de propósito.
    { files: ['src/core/theme/unistyles.ts'], rules: { 'typescript/no-empty-object-type': 'off' } },

    // Os testes: o título começa com "Should", o `.only` não fica no repositório, todo mock tem fábrica e o
    // que se espera da tela é `toBeOnTheScreen` (skill testing). Os de src/ levam também as regras de sintaxe
    // do app, menos as medidas do tema.
    {
      files: ['**/*.test.{ts,tsx}', 'jest.setup.ts'],
      rules: {
        'eslint-js/no-restricted-syntax': ['error', ...TEST_SYNTAX],
        'jest/no-focused-tests': 'error',
        'jest/valid-title': ['error', { mustMatch: { it: '^Should ', test: '^Should ' } }],
        // A regra compara a cadeia inteira: o `not.` entra por nome.
        'jest/no-restricted-matchers': [
          'error',
          {
            toBeTruthy: TRUTHY_MESSAGE,
            toBeFalsy: TRUTHY_MESSAGE,
            'not.toBeTruthy': TRUTHY_MESSAGE,
            'not.toBeFalsy': TRUTHY_MESSAGE,
          },
        ],
      },
    },
    {
      files: ['src/**/*.test.{ts,tsx}'],
      rules: {
        'eslint-js/no-restricted-syntax': ['error', ...NO_LITERAL_COLOR, ...SYNTAX_EVERYWHERE, ...TEST_SYNTAX],
      },
    },

    // Nomes proibidos. O arquivo que é o lugar certo de um nome vem depois, com a lista sem esse nome.
    {
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: NOT_APP_CODE,
      rules: { 'no-restricted-imports': restrictedImports() },
    },
    {
      files: ['src/shared/components/AppText/AppText.tsx', 'src/core/**/*.{ts,tsx}'],
      excludeFiles: NOT_APP_CODE,
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
      excludeFiles: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
      rules: { 'exports/one-export-per-file': 'error' },
    },
    // O nome do arquivo e o lugar dos tipos. Ficam de fora as rotas (o nome é o do expo-router), os testes, o que só
    // monta teste e os cenários, que levam o nome do serviço.
    {
      files: ['src/**/*.{ts,tsx}'],
      excludeFiles: ['src/app/**', ...NOT_APP_CODE, 'src/**/*.d.ts'],
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
      rules: {
        'boundaries/no-unknown-files': 'error',
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            checkAllOrigins: true,
            // Confere também o import dentro da mesma camada: sem ele, o componente de src/shared importaria um
            // serviço de src/shared sem aviso.
            checkInternals: true,
            message:
              '{{from.element.types}} {{from.element.captured.feature}} não pode importar "{{dependency.source}}": nenhuma camada conhece a de cima, e uma feature não importa outra.',
            policies: [...layerPolicies, ...packagePolicies, ...folderPolicies],
          },
        ],
        'import/no-cycle': 'error',
      },
    },
  ],
});
