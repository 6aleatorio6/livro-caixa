---
name: mermaid-diagrams
description: >-
  How to draw Mermaid diagrams that actually help a reader of this repo's Docusaurus site (docs/**/*.md, drafts in docs/98-rascunhos and docs/local included): deciding whether a picture beats a sentence or a table, picking the diagram type for the question, keeping it legible in a column that shrinks wide diagrams, in light and dark mode, the syntax that breaks Mermaid 12's parser, and checking every block without the dev server — a parse script, then a render script that draws each diagram as a PNG in both themes to look at. The build never fails on a broken diagram. Use whenever writing, editing or reviewing a ```mermaid block under docs/, whenever a page or draft would benefit from a flow, sequence, state, ER or architecture picture, and whenever a diagram shows up as an error box, with tiny text, cramped or unreadable in dark mode — even if the user never says "Mermaid". Triggers: "faz um diagrama", "desenha o fluxo", "coloca um diagrama na doc", "ilustra essa seção", "diagrama de sequência", "fluxograma", "diagrama de estados", "diagrama ER", "o diagrama quebrou", "Parse error on line", "o diagrama ficou ilegível", "texto do diagrama minúsculo", "mermaid".
---

# Mermaid diagrams in docs/

Pages and diagram labels are **pt-BR**; this skill is in English. Templates per diagram type are in
[references/templates.md](references/templates.md); parser traps, dagre layout and styling
mechanics in [references/syntax-and-layout.md](references/syntax-and-layout.md).

## How this site treats a diagram

Measured on the installed code (Docusaurus 3.10.1, `@docusaurus/theme-mermaid` 3.10.1, Mermaid
12.2.0, no `themeConfig.mermaid` in `apps/docusaurus/docusaurus.config.js`). Every rule below leans
on one of these:

- **Nothing checks a diagram before a reader sees it.** The build copies the fence text untouched;
  the SVG is drawn in the browser after hydration. A syntax error passes `pnpm docusaurus build`
  and ships as an error box where the diagram should be. The two scripts of step 5 are the only
  checks there are.
- **The built HTML holds no diagram text.** The local search indexes built HTML, so labels,
  `accTitle`, `accDescr` and a frontmatter `title` are never found — and anyone fetching the page
  without JS sees nothing there. Every term that matters has to be in the prose too.
- **Light and dark redraw the diagram with Docusaurus's default themes** (`default` / `dark`).
  Whatever pins a color or a theme — `style`, a `classDef` fill, frontmatter
  `theme`/`themeVariables`/`look`, `%%{init}%%` — stays the same in both modes, and a light fill
  ends up a bright block on the dark page.
- **A wide diagram shrinks to the column, text included.** Mermaid's `useMaxWidth` is on (the site
  passes no options), so an SVG wider than the doc column — about 800 px on a 1440 px screen — is
  scaled down until it fits. A long `LR` flowchart ends with labels nobody can read. Width is the
  budget; height is free.
- **Every flowchart box is at least 152 px wide.** Labels wrap at 120 px (`flowchart.wrappingWidth`)
  and the box adds 32 px of padding, even around a one-letter label; only a word longer than the
  wrap widens it. Four boxes side by side fit the column (744 px); a fifth makes the diagram 936 px
  wide and shrinks it, text included, to about 85%.
- **The layout is ELK.** Mermaid 12 bundles it and makes it the default for flowchart, state, ER
  and class diagrams (the theme's optional `@mermaid-js/layout-elk` peer is not needed and not
  installed). Under ELK, extra dashes don't lengthen an edge (`a ----> d` lays out like `a --> d`)
  and `flowchart.nodeSpacing`/`rankSpacing` do nothing. A diagram whose frontmatter asks for
  `layout: dagre` gets both back (section *Layout under ELK* in
  [syntax-and-layout.md](references/syntax-and-layout.md)).
- **A ```mermaid fence works the same in `.md` and `.mdx`**, and its body is literal in both — no
  escaping `{`, `<` or `|`. Anything after `mermaid` on the fence line (`title="…"`) is dropped:
  there is no caption slot. Keep pages `.md`.

## 1. Decide whether to draw

Write the sentence that will introduce the diagram first: the question it answers and what the
reader should notice. If that sentence won't come, don't draw — decorative figures make a page feel
richer without teaching anything.

Text wins when the content is:
- a chain of 3–4 steps with no branch or loop → a sentence, or a numbered list if order matters;
- items with 3+ attributes each, or options compared on criteria → a table;
- terms and definitions → a list.

A diagram wins for branches and decisions, many-to-many relations, cycles and state transitions,
message order between 3+ participants, and containment/boundaries.

One question per diagram. Structure ("what connects to what") and behavior ("what happens, in
which order") never share a picture — draw two.

## 2. Pick the type for the question

| Question | Mermaid |
|---|---|
| What are the parts (web, api, banco, external services) and how do they talk? | `flowchart` with a `subgraph` per boundary |
| What happens, in what order, between whom, in one scenario? | `sequenceDiagram` |
| Which path does a process or decision take? | `flowchart TD` |
| What states can X be in, and what moves it between them? | `stateDiagram-v2` |
| What are the entities and their cardinalities? | `erDiagram` |
| When does each thing happen, as phases? | `timeline` |
| Where do options sit on two axes? | `quadrantChart` (say in the prose that positions are judgment calls) |
| How are the classes organized? | Usually nothing — it drifts first; link the code. `classDiagram` only for a real type relationship (interfaces, inheritance) |

Avoid `C4Context`/`C4Container` (experimental, fixed colors that ignore dark mode, no
auto-layout) and `architecture-beta` (force layout, siblings overlap): a flowchart with subgraphs
says the same thing predictably.

## 3. Keep it legible

**Size.** Working caps: flowchart ~12 nodes / ~15 edges, sequence 5 participants / ~12 messages,
state ~10 states, ER ~8 entities, one level of `subgraph` nesting. Past them, split:
- *overview + zoom* — a node in the overview becomes its own diagram further down, same name,
  drawn as a subroutine `[["…"]]` in the overview;
- *one scenario per sequence* — happy path first; an error path gets its own diagram or one `alt`;
- *detail into a table* under the diagram (fields, per-case rules).

**Direction.** `TD` by default, with at most 4 boxes in its widest row. `LR` only for a short
pipeline of up to 4 boxes — a fifth outgrows the column and the text shrinks. Pick the direction of the main flow
and draw exceptions across it.

**Words.** Nodes are nouns, in the words the page and the code already use. Edges are verb
phrases, so *source + label + target* reads as a sentence (`web -->|"chama"| api`). No abbreviation
the page hasn't introduced; technology names spelled officially (NestJS, SQL Server). Flowchart
labels wrap on their own at 120 px; `<br/>` only to choose where a long one breaks.

**Decisions.** A question in a rounded box `("…?")` with `sim`/`não` on the outgoing edges. Not
the diamond `{…}`: it grows with its text, and a wrapped question becomes a huge rhombus.

**One vocabulary**, so no legend is needed:

| Mermaid | Means |
|---|---|
| `id["…"]` | component, module, step |
| `id[("…")]` | data store (SQL Server, cache) |
| `id("…?")` | decision — a question |
| `id(["…"])` | start/end, or a person |
| `id[["…"]]` | detailed in another diagram or page |
| `subgraph` | boundary: app, process, module |
| `-->` | call / control flow |
| `-.->` | asynchronous, event, optional |
| `==>` | the one path the prose tells the reader to follow (rarely) |
| sequence `->>` / `-->>` / `-)` | request / response / async message |

Going beyond it (a second line style, a highlighted node) earns a one-line legend in the prose
right after the diagram.

**Code shape.** Ids are short ASCII and meaningful (`api`, `banco`, not `A`, `B`); labels always in
double quotes — that single habit avoids most parse errors (`(`, `/`, `#`, `end`). One edge per
line once the diagram is more than a chain. Declare nodes and edges in the order they should be
read.

**No styling by default.** No `style`, no hex fills, no frontmatter `theme`/`themeVariables`/`look`,
no `%%{init}%%`. When emphasis is really needed, carry it with shape or line —
`==>`, `classDef destaque stroke-width:3px` — never color alone (section *Styling that survives
both themes* in [syntax-and-layout.md](references/syntax-and-layout.md)).

## 4. Surround it with prose

- **Before:** the sentence from step 1 — the question, and where to look ("Siga a seta grossa: é o
  único caminho que grava no banco."). Refer to it as "o diagrama a seguir", never "acima" or "à
  direita".
- **After, if needed:** the takeaway in one sentence, and the one-line legend if you went beyond
  the vocabulary.
- **Every searchable term in the text** — entity names, statuses, endpoints the diagram shows.
- **`accTitle:`** on the line after the diagram keyword, naming what the diagram is (screen
  readers announce it). Skip `accDescr`: the surrounding prose is the description, and a second copy
  inside the block drifts. `accTitle` breaks the parse in `mindmap`, `block` and `sankey`.

## 5. Validate: parse, then look

```bash
node .claude/skills/mermaid-diagrams/scripts/check-mermaid.mjs docs/<path>/<page>.md
node .claude/skills/mermaid-diagrams/scripts/render-mermaid.mjs <scratchpad>/mermaid docs/<path>/<page>.md
```

**`check-mermaid.mjs`** parses every ```mermaid block with the site's own Mermaid (resolved through
`@docusaurus/theme-mermaid`) inside the jsdom of `apps/docusaurus`, in ~3 s, with no browser. Per block it
prints `ok <file>:<line> <type>`, or `ERROR` with the parser's message and caret (the line in the
message counts from the block's first line); exit code 1 on any error. It also takes folders —
`docs` checks every page and draft, skipping `docs/local/__trash`.

**`render-mermaid.mjs`** draws every block of the pages it gets as the site would — the same
Mermaid, the `default` and `dark` themes on the site's backgrounds, in the 800 px column — and writes
`<page>-L<line>-light.png` and `-dark.png` to the folder in its first argument, about a second per
diagram. Point it at the session's scratchpad, never at `docs/`. It drives the machine's Chromium
(`chromium-browser`; `CHROME=<binary>` for another).

Fix every `ERROR`, then **open both PNGs of every diagram you wrote or touched** and look for what
parsing can't see: labels over edges or over each other, text too small because the diagram
shrank to the column, a node or a color that disappears in dark mode, an order that reads badly.
Fix and render again. When handing the page over, say you looked at the PNGs — they are close to
the page, not identical: the reader's fonts and screen width vary.

No Chromium on the machine: say the diagrams are unchecked visually and ask the user to look at
them on the dev server (`pnpm dev:docs`) in light **and** dark mode.

## Fixing a diagram that already exists

- **Error box on the page** — run `check-mermaid.mjs` on the page; the message has the line and a
  caret. The usual causes, and the silent misparses, are in section *Parse errors* of
  [syntax-and-layout.md](references/syntax-and-layout.md).
- **Text too small** — the diagram outgrew the column. Switch `LR` to `TD`, split it (step 3), or
  turn a chain into a sentence (step 1). Spacing options don't help: under ELK they do nothing, and
  every box keeps its 152 px.
- **Unreadable in dark mode** — a pinned color or theme; the dark PNG shows it. Remove it and carry
  the meaning with shape or line.
- **Scrambled order** — reorder the declarations to reading order; then an invisible edge
  (`a ~~~ b`) or a subgraph; as a last resort, `layout: dagre` (section *Layout under ELK* of the
  same file).
