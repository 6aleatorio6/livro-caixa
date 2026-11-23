---
paths:
  - "apps/mobile/**"
---

# The commit formats, lints and type-checks: don't do it by hand

The git `pre-commit` (`.githooks/pre-commit`, wired by `pnpm install` through the root `prepare`
script) runs lint-staged with `apps/mobile/.lintstagedrc.mjs` on the commit's files:
- oxfmt formats the JS and TS files, and lint-staged puts the formatting in the commit;
- Oxlint checks the same files;
- once per commit, `scripts/typecheck-index.mjs` checks the types of the whole app as they are in the
  index, so an error your change causes in a file outside the commit refuses it too, and what another
  session hasn't staged doesn't. A commit that only deletes app files is checked too.

An Oxlint error, a type error or a formatter failure refuses the commit. An Oxlint warning doesn't,
and the hook's `--quiet` doesn't even print it: warnings show up only in the app's `lint`.

- **Don't format, lint or type-check by hand while implementing**: no `oxfmt`, `format`, `lint`,
  `oxlint`, `tsc` or `typecheck` between edits. A file written by a script in `Bash` is formatted by
  the commit too.
- **After a commit, a file you edit again may have changed on disk**: when `Edit` says the file was
  modified or an `old_string` no longer matches, read the file again.
- **When the commit is refused, read the output and fix the code**, then `git add` and commit again.
  lint-staged prints each failed task with its command, and the paths are relative to the app. A
  type error may be in a file you didn't stage: fix it and stage it with the rest. A task that failed
  to run (a broken configuration, a missing binary) is not a finding to fix in the code.
- **Never `git commit --no-verify`.** What gets past the hook only shows up in the branch review,
  which runs `typecheck` and `lint` on the whole app: a type error (the hook's type check skips
  itself during a rebase, and uses TypeScript 7, where the `tsc` of `typecheck` is the app's own
  6.0), a lint or formatting finding (also in the rebase's lint-staged).
- **The hook needs `node_modules`**: without it, the commit passes with a warning and no check.
  Committing needs the Node of the root `package.json` `engines` (lint-staged 17's minimum).
- **A new expo-router route doesn't exist for the types** until Metro rewrites
  `.expo/types/router.d.ts`: a commit that links to it is refused by the type check until then.
