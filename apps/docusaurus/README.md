# Portal da documentação

Site [Docusaurus](https://docusaurus.io/) que publica os arquivos Markdown de `../../docs`
(ver `docusaurus.config.js`). É o pacote `livro-caixa-docs` do *workspace* pnpm do repositório.

## Instalação e desenvolvimento

```bash
pnpm install              # na raiz do repositório: instala o workspace
pnpm dev:docs             # da raiz; ou `pnpm start` dentro de apps/docusaurus
```

O servidor sobe sempre em `http://localhost:4000`: a 3000, a padrão do Docusaurus, fica livre para
a API que vier depois, e o script que confere a compilação procura o servidor nessa porta (ver
[Erros de compilação](#erros-de-compilação)).

## Erros de compilação

**Cada compilação grava o resultado em `compile-errors.log`, nesta pasta, que só existe enquanto há
algo a dizer.** É por ele que a IA, que escreve quase toda doc e não vê o terminal do servidor,
sabe se o `.md` que acabou de salvar compila. O arquivo fica fora do Git.

- **Ausente:** a última compilação passou.
- **`[client] compilando — <hora>`:** uma compilação está em andamento.
- **Qualquer outra coisa:** os erros, numa seção por compilador, com o caminho da doc (relativo a
  esta pasta, por isso `../../docs/…`), a posição e a mensagem que o terminal imprime.

Quem grava é o plugin `src/plugins/compile-errors/`. O Docusaurus chama o `configureWebpack` dele uma
vez por compilador (`client` no `start`; `client` e `server` no `build`), e cada compilador ganha um
plugin do webpack: no gancho `compile`, a seção do compilador vira "compilando"; no `done`, vira a
lista de erros ou sai do arquivo, que é apagado quando nenhum compilador tem seção. O `done` entra
com `stage: -1` porque, no `build`, o `ForceTerminatePlugin` do Docusaurus encerra o processo no
próprio `done` quando o `client` falha, e um gancho com o `stage` padrão nunca rodaria.

**Depois de salvar uma doc, `node apps/docusaurus/scripts/wait-for-compile.mjs`** (da raiz) espera
o arquivo ficar 2 s parado fora do "compilando", porque um save dispara mais de uma compilação
seguida, e imprime o desfecho. Se nada mudar na espera, ele pergunta à porta 4000 se o servidor está
no ar.

**Entram** a sintaxe de MDX num `.mdx` e o módulo que não existe. Os `.md` são CommonMark
(`markdown.format: 'detect'`), e `{` e `<` neles são texto.

**Nunca entram:**

- **Link quebrado entre rotas.** O `onBrokenLinks: 'throw'` só é conferido no fim do `build`.
- **Link de Markdown para um `.md` que não existe.** O `onBrokenMarkdownLinks` só avisa no terminal.
- **Diagrama Mermaid quebrado.** O SVG é desenhado no navegador: confira a página aberta.
- **Erro que só acontece no navegador** e **aviso** do webpack.

`pnpm test` roda os testes do plugin no `node --test`, com um compilador falso.

## Build

```bash
pnpm --filter livro-caixa-docs build   # da raiz; ou `pnpm build` dentro de apps/docusaurus
```

Gera o site estático em `build/`. Links quebrados **derrubam o build**.

## Busca

A busca é local (`@easyops-cn/docusaurus-search-local`): o índice é gerado no `build` e servido
junto com o site, sem enviar conteúdo para nenhum serviço externo. No `pnpm start` a caixa de busca
aparece, mas só responde depois de um build: teste com `pnpm build && pnpm serve`.

## Publicação (Netlify)

A configuração está em `netlify.toml`, com os caminhos relativos à **raiz do repositório**. No
painel da Netlify:

- **Base directory:** vazio (a raiz), onde está o `pnpm-lock.yaml`. Sem ele a Netlify instala com o
  npm.
- **Package directory:** `apps/docusaurus`.

O acesso é protegido pela *edge function* `netlify/edge-functions/password-gate.ts`, com a senha na
variável `DOCS_PASSWORD`. Sem a variável, o portal responde 503 em vez de ficar público. **Depois de
qualquer publicação, confira que o portão está no ar**: uma página inexistente tem de responder
`401`, não `404`.

```bash
curl -sI https://<site>/qualquer-coisa | head -1
```

A `netlify-cli` (`pnpm netlify:deploy` / `pnpm netlify:preview`) tem um defeito conhecido em
*workspaces*: empacota a *edge function* num caminho duplicado e publica o site **sem ela**, sem
erro nenhum. Prefira o deploy contínuo pelo Git; se usar a CLI, publique primeiro com
`pnpm netlify:preview` e faça a verificação acima na URL de rascunho antes do `--prod`.
