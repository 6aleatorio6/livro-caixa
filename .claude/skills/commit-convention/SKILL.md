---
name: commit-convention
description: >-
  How to write commits in this repository — Conventional Commits in pt-BR with the app as scope, a
  short subject and a body that carries only what the diff doesn't show, one change per commit
  carrying everything that moves with it (code in every app it touches, tests, the regenerated
  contract, docs, ADRs, rules), neither too thin nor too bloated (a few hundred hand-written lines;
  a bigger feature is cut into reading and editing). Use whenever writing a commit message, making a
  commit, deciding which files belong in the same commit, or deciding whether a commit should be
  split in two. Triggers: "faz o commit", "commita isso", "vá comitando", "escreve a mensagem de
  commit", "a mensagem está longa", "descrição do commit prolixa", "reescreve as mensagens", "posso
  juntar essas mudanças num commit só", "como agrupar esses arquivos".
---

# Commit convention

Nothing here enforces it — no commitlint, no `commit-msg` hook. The convention comes from the
history of an earlier project, where this repository's template was born; the examples below are
commits from it. Follow it anyway.

## 1 — Format

```
<type>(<scope>): <subject>

<optional body>

Co-Authored-By: ...
```

**Subject:** pt-BR, starts in lower case, no final full stop, up to ~72 characters. It says what
changes for whoever uses the code — one thing. If it needs an "and" to fit, name the whole instead
of listing its parts, or split the commit (§3).

**Type** — the ones that history uses:

| Type | For |
|---|---|
| `feat` | behaviour a user or an API consumer sees that did not exist |
| `fix` | behaviour that was wrong |
| `refactor` | the same behaviour, different code |
| `test` | tests only |
| `docs` | content under `docs/` that no code change brings with it |
| `build` | the pnpm workspace, the lockfile, `scripts/` that build or copy the code |
| `chore` | tooling: `package.json` scripts, `.gitignore`, `.claude/skills/**`, an app's config |

**Scope** — the app whose code changes: `mobile` or `docusaurus` (`back` and `web` belong to that project). No
scope when the code changes in more than one app (`feat: entrada pelo Microsoft Entra ID` touched
back and web there) or in none (`docs:`, `chore:` on root tooling). What follows the code doesn't
count for the scope: a `refactor(back)` that also updates an ADR and a `.claude/rules` file is
still `(back)`.

**The body carries only what the diff does not show — why, or the constraint behind the change —
in one to three sentences.** Before each sentence, ask whether someone reading the diff already
knows it; if so, cut it. Write the short version first.

- `feat` — the decision or outside constraint the code doesn't show: why this design and not the
  obvious one. Nothing like that → no body.
- `fix` — the effect of the problem, then the fix, in up to two sentences.
- `refactor` — what made it necessary, in one sentence.
- `test`, `docs` — no body, unless the commit's state would surprise (tests that land failing,
  before the code they cover).

Never in the body: the classes, components, hooks or files that changed; the list of what followed
along (ADRs, the generated contract and types); the list of test cases; test counts; a business
rule the feature docs already explain.

```
refactor(back): Email.from vira Email.fromString

O nome diz de onde o e-mail vem: de um texto qualquer, que o método
normaliza (tira os espaços das pontas e baixa a caixa).
```

The commit in that history went on with the call sites that followed the new name, the ADR that
cites it and "os 38 testes de users/domain passando" — the diff and the test run already say all of
it.

## 2 — One change per commit, with everything that moves with it

A commit is not limited to one area: a change lands whole. Its commit carries, together:

- the code in every app it touches — `apps/back` **and** `apps/web` when the change crosses the
  API;
- the tests that cover it;
- the regenerated API contract and the types generated from it, once the API has them — a contract
  change without them leaves the two apps out of step;
- the documentation it changes: the ADR or the page of `docs/05-arquitetura/` that records the
  decision, the feature page;
- the `.claude/rules/*.md` a new convention changes.

A `docs:` commit alone is for documentation no code brings with it: a business rule, a doubt
answered, a tutorial. A `chore:` alone for tooling.

## 3 — Commit size: neither thin nor bloated

**Test:** can the whole change be described in a single sentence, and would reverting the commit
undo only that, without breaking anything else? If yes, the size is right.

- **Too bloated** — mixes purposes that don't depend on each other: an unrelated fix + refactor,
  a feature + docs for something else, changes in two features that don't touch. Symptom in the
  message: it turns into an "and" list (`corrige X e também ajusta Y e limpa Z`).
- **Too thin** — breaks a cohesive change into pieces that, on their own, leave the repo in an
  incoherent state: the route without the screen that calls it, the entity without its migration,
  the code without the regenerated contract, a convention without the rule and the ADR that state
  it.

**Size: a few hundred hand-written lines per commit.** A regenerated contract travels along but
doesn't count. A feature bigger than that is cut into deliverables that work alone, each one a
commit with everything that moves with it — usually **reading** (the tables and their load, the
`GET`, the screen as a read-only user sees it, the read permission), then **editing**
(`PUT`/`PATCH`, rules, errors, DTOs, dialogs, Salvar, the edit permission). The reading files are
the final ones minus the writing parts, so the editing diff shows only what editing adds. A
migration never splits: it goes whole in the first commit that needs it. Decide the cut when
planning, one plan section per commit: in that project, commits of 1,700 to 2,900 lines came out of plan
sections sized by feature, and that branch had to be redone.

**Split into separate commits:** an unrelated fix or refactor noticed along the way; a feature and
a docs update that isn't about it; changes in independent modules; one rename applied across many
use cases and a rule change that doesn't depend on it.

Two unrelated changes inside the same file: `git add -p` is interactive and not available here.
Stage the intermediate version instead — write the file as it should be in the first commit,
`git hash-object -w --stdin < that-version` and
`git update-index --cacheinfo 100644,<hash>,<path>` — commit, then `git add` the rest.

## 4 — Don't commit what isn't yours

Before staging, compare `git status` with what this session changed. A modified file the session
never touched is someone else's work in progress: leave it out of the stage and say so in the
report. Same for untracked files the session did not create.
