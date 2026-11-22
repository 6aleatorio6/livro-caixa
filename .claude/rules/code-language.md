# Language: code and instructions in English, text for people in pt-BR

**Code and the instructions for the AI are written in English.** That holds for `apps/docusaurus`,
`apps/mobile`, `scripts/` and `.claude/`, and includes:

- identifiers: classes, functions, components, *hooks*, variables, parameters, properties, types,
  constants and enum values;
- file and folder names, images and role suffixes included (`.repository.ts`, `.page.tsx`) —
  except under `docs/`, whose folders and pages are documentation;
- the routes of `src/app`;
- cache keys, *store* names, *story* titles, `package.json` scripts, environment variables;
- database: tables, columns and enums;
- the `message` of an `AppError`: it is for the developer. The text for the user goes in its
  `userMessage`, in pt-BR (skill `actions-and-feedback`);
- skills, rules and every `CLAUDE.md`.

**In pt-BR:**

- the documentation: `docs/` and the READMEs;
- comments and JSDoc;
- all text the user reads: the error message shown to them, labels, *placeholders*,
  `aria-label`, e-mails;
- log messages and those of the other exceptions (the plain `Error`, not an `AppError`) — including
  the ones a test throws or checks;
- sample data (names of people, areas, units);
- commit messages (skill `commit-convention`) and branch names (`#NN-assunto`, root `CLAUDE.md`).

**Why:** what is read as code stays in one language, the same as the libraries, the database and
the contract — with no "project in Portuguese, library in English" border for review to watch. What
is read as text stays in the language of the people who use the platform. The rule comes from an earlier
project (its ADR-0041); keeping skills, rules and `CLAUDE.md` in English too is this repository's
decision.

**How to apply:**

- When creating or renaming something, pick the English name, even if the neighbouring file still
  has Portuguese leftovers — and if it does, fix them.
- A comment that cites an identifier cites the English name (`` `ChangeUserRoleUseCase` ``), inside
  the Portuguese sentence.
- An instruction file may quote pt-BR where the quote is text: a page title, a folder of `docs/`, a
  phrase the user types.
- Code examples in the documentation follow the same rule: identifiers in English, comments in
  pt-BR.
