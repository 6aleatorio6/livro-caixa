# new-project

Documentation for new-project; the brainstorm is still defining the product.

A pnpm monorepo. For now only the documentation exists: the Markdown in `docs/` and the Docusaurus
portal that publishes it, in `apps/docusaurus`. The back-end and the front-end come later, as
`apps/back` and `apps/web`, once the project's context settles the stack. Until then, no stack
decision is made without being written in `docs/`.

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
