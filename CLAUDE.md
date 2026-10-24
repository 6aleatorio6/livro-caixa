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

Code, skills, rules and every `CLAUDE.md` are written in English, file names included. In pt-BR:
comments, the documentation (`docs/`, READMEs, the folders and pages of `docs/` included), the text
people read, commit messages and branch names.

## Documentation

The rules for writing the documentation are in [docs/CLAUDE.md](docs/CLAUDE.md). Working drafts
(plans, notes, PR descriptions) live in `docs/local/`, outside Git.

The design is made in Pencil, in `design/`. A `.pen` file can only be read and edited through the
`pencil` MCP.
