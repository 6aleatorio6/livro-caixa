# Livro-Caixa

A mobile app to manage one family's finances. The brainstorm is still writing its documentation.

A pnpm monorepo. For now only the documentation exists: the Markdown in `docs/` and the Docusaurus
portal that publishes it, in `apps/docusaurus`. The phase is documentation only: no code and no
design file yet. The app will be a mobile app in Expo + React Native on Firebase, with no web
app, created from scratch with the latest version of each tool —
[docs/05-arquitetura/01-plataforma-e-stack.md](docs/05-arquitetura/01-plataforma-e-stack.md). No
other stack decision is made without being written there.

- `pnpm install` at the root installs the workspace.
- `pnpm dev:docs` serves the portal at `http://localhost:4000`.
- `pnpm verify` runs the portal's tests and the build, which fails on a broken link.

## Language

Code, skills, rules and every `CLAUDE.md` are written in English. In pt-BR: comments, the
documentation, the text people read, commit messages and branch names —
[.claude/rules/code-language.md](.claude/rules/code-language.md).

## Branches

`main` triggers the CI (not configured yet). Work happens on `#NN-subject` branches: a two-digit
sequential number and a kebab-case subject in pt-BR, as in projeto-a (`#01-inicio`,
`#02-banco-real-nos-endpoints`). Each one merges into `main` when it is done. After the
installation commit nothing is committed straight to `main`, and `main` is the `<base>` of the
"Revisão da branch". The first branch, `#01-brainstorm`, is where the brainstorm writes the
documentation. Commit messages follow the `commit-convention` skill.

In the shell, quote the name: a `#` at the start of a word begins a comment —
`git switch -c "#04-assunto"`.

## Documentation

The rules for writing the documentation are in [docs/CLAUDE.md](docs/CLAUDE.md). Working drafts
(plans, notes, PR descriptions) live in `docs/local/`, outside Git.

The design is made in Pencil, in `design/`. A `.pen` file can only be read and edited through the
`pencil` MCP.

The data model is drawn in dbdiagram.io, in
[docs/05-arquitetura/modelo-de-dados.dbml](docs/05-arquitetura/modelo-de-dados.dbml), and serves
only the documentation: no SQL or migration is generated from it. The file is the source: the model
is edited in it, pasted into dbdiagram.io to see the diagram, and what changes there comes back to
the file. Tables, columns and enums are named in English, `Note`s and `//` comments are in pt-BR.
