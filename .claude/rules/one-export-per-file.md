---
paths:
  - "apps/mobile/**"
---

# One exported declaration per file

In `apps/mobile`, **each file exports a single declaration**: one function, one class,
one interface, one type or one enum. Never two in the same file. The file carries the name of what
it exports — skill `project-structure`.

**What counts and what doesn't:**

- **Only what is exported counts, except components.** A helper that only that file uses
  (`toUser()`, a type for the API response) stays in it. When a second file needs it, it gets its
  own file.
- **A UI component always has its own file**, in its own folder, even with a single caller: in the earlier
  project, `ItemRow` in its own file, used only by `ItemsForm`. Only the styling that belongs to that component stays in
  the file. A constant both files come to use gets its own file.
- **A value constant doesn't count**, and lives with the type derived from it: `USER_ROLES` with the
  role type, `loginSchema` with the type of the login values.
- **A constant holding a function counts**: a decorator (`const Public = () => …`), a *hook* made by
  a factory (`const useSession = createPersistedStore(…)`).
- **The props interface lives with the component**: `IButtonProps` in `Button.tsx`. Every other
  type lives in a `types/` folder.
- **Tests (`*.spec.ts`, `*.test.tsx`), stories, `*.d.ts` and generated code are left out.**
- An `index.ts` that re-exports from several files breaks nothing: re-exports don't count.

**Why:** in the earlier project, files grew by accretion (`domain-error.ts` with ten exports, each module's errors in
one `*.errors.ts`), and the file name stopped saying what was in it. There the decision is ADR-0043,
and the component in its own file is its 2026-10-21 addendum.

**How to apply:**

- The lint (`lint/exports.ts`) checks it, except a local component: that is on whoever writes and
  whoever reviews.
- Two more rules of the same plugin check the file's name against what it exports
  (`exports/name-matches-file`) and that a type lives in `types/` (`exports/type-in-types-folder`).
- A type and a factory with the same name: the type stays in the file named after it, the factory
  gets the prefix (`HttpClient.ts` + `createHttpClient.ts`).
- A `let` variable that functions in different files change can't be imported and reassigned: give
  it an object as owner.
- When splitting, update the module's `index.ts` and search `docs/` for the old path.
