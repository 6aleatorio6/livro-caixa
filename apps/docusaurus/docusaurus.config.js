// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

import compileErrorsPlugin from './src/plugins/compile-errors/index.mjs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Pastas de trabalho interno (numeradas 97-99 para ficarem no fim da
// navegação). Aparecem **apenas em desenvolvimento** (`docusaurus start`),
// para consulta do time; no build de produção são excluídas. Ver `exclude` do
// preset docs e o hook de links quebrados abaixo.
const INTERNAL_FOLDERS = ['97-reviews', '98-rascunhos', '99-duvidas'];

// `docusaurus start` roda com NODE_ENV=development; `docusaurus build`, com
// production.
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

const UNPUBLISHED_FOLDERS_PATTERN = new RegExp(
  `(^|/)(${INTERNAL_FOLDERS.join('|')})/`,
);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Livro-Caixa',
  tagline: 'App de celular para controlar o financeiro de uma família',
  favicon: 'img/favicon.ico',

  url: 'https://example.com',
  baseUrl: '/',

  organizationName: 'livro-caixa',
  projectName: 'livro-caixa-docs',

  onBrokenLinks: 'throw',

  // Interface em português do Brasil (Anterior/Próximo, busca, etc.)
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  // Arquivos .md são tratados como CommonMark (mais tolerante); só .mdx como MDX.
  markdown: {
    format: 'detect',
    mermaid: true,
    hooks: {
      // Os documentos podem citar as pastas internas. Em produção elas não são
      // geradas, então esses links viram âncoras inertes em vez de quebrar o
      // build. Em desenvolvimento os arquivos existem e os links funcionam.
      onBrokenMarkdownLinks({url, sourceFilePath}) {
        if (!IS_DEVELOPMENT && UNPUBLISHED_FOLDERS_PATTERN.test(url)) {
          return '#';
        }
        console.warn(
          `[docs] Link markdown quebrado em "${sourceFilePath}": ${url}`,
        );
      },
    },
  },

  themes: [
    // Renderização de diagramas Mermaid (fluxogramas, máquina de estados).
    '@docusaurus/theme-mermaid',
    // Busca offline: o índice é gerado no `build` e servido junto com o site.
    // Nenhum conteúdo sai para serviço externo (Algolia).
    [
      '@easyops-cn/docusaurus-search-local',
      {
        // Português primeiro (stemmer/stop words); inglês para os termos
        // técnicos que aparecem no meio do texto.
        language: ['pt', 'en'],
        // Os docs estão na raiz do site (`routeBasePath: '/'`) e vêm de fora
        // do app (`docsDir` é usado para calcular o hash do índice).
        docsRouteBasePath: '/',
        docsDir: '../../docs',
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        // Nome do índice com hash: evita servir índice velho de cache.
        hashed: true,
        // Destaca os termos buscados ao abrir o resultado.
        highlightSearchTermsOnTargetPage: true,
        // Mostra o caminho (seção > subseção) de cada resultado.
        explicitSearchResultPath: true,
      },
    ],
  ],

  // Grava os erros de cada compilação em `compile-errors.log`, para quem não vê o terminal do
  // servidor (ver README, "Erros de compilação").
  plugins: [compileErrorsPlugin],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: undefined,
          // Mantém os excludes padrão do plugin.
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
            // CLAUDE.md são instruções para a IA, não páginas do portal.
            '**/CLAUDE.md',
            // Revisões, rascunhos e dúvidas: visíveis no `start`, fora do build.
            ...(IS_DEVELOPMENT
              ? []
              : INTERNAL_FOLDERS.map((folder) => `${folder}/**`)),
          ],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Livro-Caixa',
        logo: {
          alt: 'Livro-Caixa',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentação',
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Construído com Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
