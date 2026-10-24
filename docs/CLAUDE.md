# docs — rules for editing the documentation

The pages are written in pt-BR; these instructions are in English.

## Organization

Each section is a numbered folder, and the numbering sets the order in the portal (Docusaurus strips
it from the labels). The folder gets a `_category_.json` with the label and the position, for
example `{ "label": "1. Visão Geral", "position": 1 }`. A section is created only when it gets its
first page. No empty folders.

| Folder | What it holds |
|---|---|
| `01-visao-geral/` | Context and problem, goals and benefits, audience and profiles |
| `02-negocio/` | Business rules and processes, glossary |
| `03-funcionalidades/` | One page per feature, in `01-principal/` and `02-suporte/` |
| `04-escopo-excluido/` | What is left out, one page per item and an `index.md` with the overview |
| `05-arquitetura/` | Stack, back-end, front-end, data, integrations and ADRs. Only once the stack is decided |
| `06-anexos/` | Files received: spreadsheets, PDFs, transcripts |
| `97-reviews/`, `98-rascunhos/`, `99-duvidas/` | Internal work: they show up only in `pnpm dev:docs` |

This folder's `README.md` is the portal's home page and keeps the table of contents up to date:
every new page goes into it.

## A feature page

It opens with one or two sentences on what the feature does and for whom. Then, in the sections
that apply: who uses it and when, the step-by-step flow, the business rules, what shows on the
screen, and **Critérios de aceite**, as verifiable items. What is not known yet stays on the page as
"a validar" and gets a line in `99-duvidas/01-duvidas.md`.

## The published documentation does not reference the internal work folders

The files in `01-…` to `06-…` **never** reference those in `97-reviews/`, `98-rascunhos/` and
`99-duvidas/`. That holds for links and also for mentions by the document's name or by the code of
an item that only exists there (for example, `D-03`).

**Why:** folders 97 to 99 are temporary and will be deleted one day. A reference to them becomes a
broken link or points to something that no longer exists.

**How to apply:**

- What the published page needs to say is written **on it**. For example, an open point stays as
  "a validar com o cliente", without "ver Dúvidas D-03".
- The opposite direction is free: folders 97 to 99 may cite the published documentation.
- Before finishing, check that the search below returns nothing:

  ```sh
  grep -rnE '97-reviews|98-rascunhos|99-duvidas' docs/0[1-6]-*
  ```

## After saving a doc, check that it compiles

After creating, changing or deleting a `.md` or `.mdx`, run
`node apps/docusaurus/scripts/wait-for-compile.mjs` and say in the answer what it printed: clean, or
the error found and already fixed.

**Why:** a doc's error (malformed MDX, an import of a component that doesn't exist) only shows up
when webpack compiles the page, in the terminal of the developer's `pnpm dev:docs`, which the AI
doesn't see. The `compile-errors` plugin writes each compilation to
`apps/docusaurus/compile-errors.log`, and the script waits for the compilation the save triggered and
reads that file (the `apps/docusaurus` README, "Erros de compilação").

**How to apply:**

- Assume `pnpm dev:docs` is up, on port 4000.
- If the script says the server is down, stop and ask the developer to start (or restart)
  `pnpm dev:docs`; then save the doc again and rerun the script.
- Don't run `pnpm docusaurus build` or start another server in place of the missing one: both
  compile the whole site and hide from the developer that the server went down.
- The file reports neither broken links nor Mermaid diagrams: a link, only the `build` reports; a
  diagram, `check-mermaid.mjs` and the PNGs of `render-mermaid.mjs` from the `mermaid-diagrams`
  skill.
