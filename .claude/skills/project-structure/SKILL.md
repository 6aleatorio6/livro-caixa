---
name: project-structure
description: >-
  Where each file of apps/mobile lives and how it is named: the four layers of src/ (app, core,
  modules, shared) and what each may import, the folder of a module and of a page, the role
  suffixes, and what apps/mobile/eslint.config.mjs already enforces. Use before creating a file,
  folder, screen, module, hook, store, service or component in apps/mobile, when moving one, and
  when the lint reports boundaries/dependencies, check-file or one-export-per-file. Triggers:
  "cria a tela", "novo módulo", "onde coloco", "nova pasta", "novo hook", "novo serviço",
  "boundaries/dependencies", "não pode importar".
---

# Project structure of apps/mobile

All paths below are relative to `apps/mobile/`. Imports use the `@/` alias for `src/`.

## The four layers

```
src/
├── app/       routes (expo-router): each file only re-exports a page
├── core/      composition root: app container, providers, what is mounted once
├── modules/   one folder per domain (auth, entries, recurring-bills…)
└── shared/    what any module uses: theme, components, hooks, services, utils, store, errors
```

| Layer | May import | Never imports |
|---|---|---|
| `app` | `core`, `modules`, `shared` | — |
| `core` | `modules`, `shared` | `app` |
| `modules/<m>` | its own module, `shared` | `app`, `core`, another module |
| `shared` | `shared` | `app`, `core`, `modules` |

`eslint-plugin-boundaries` enforces this table (`boundaries/dependencies`), and `import-x/no-cycle`
forbids cycles. When a module needs something from another one, that piece belongs in `shared`;
if it can't move, stop and ask before opening a door between modules.

## A route

A file in `src/app/` follows expo-router's names (`_layout.tsx`, `[id].tsx`, `(auth)/`,
`+not-found.tsx`) and is the only place with `export default`:

```ts
export { SignInPage as default } from '@/modules/auth/pages/sign-in/sign-in.page';
```

`_layout.tsx` files hold the navigation configuration: stacks and `Stack.Protected` guards.

## A module

```
src/modules/<module>/
├── pages/<page>/
│   ├── <page>.page.tsx       the screen
│   ├── components/           used only by this page
│   ├── hooks/
│   └── actions/              do-*.action.ts: the async actions the screen fires
├── components/               shared by the module's pages
├── hooks/
├── services/                 Firestore and Storage reads and writes (*.service.ts)
├── types/
└── constants/
```

Folders appear when their first file does. Where a piece goes depends on **who uses it**:

| Used by | Goes to |
|---|---|
| one page | `pages/<page>/components` (or `hooks`, `actions`) |
| the pages of one module | `modules/<module>/components` (or `hooks`, `services`…) |
| more than one module | `shared/components` (or `hooks`, `services`…) |

When a second user appears, move the piece up one level in the same commit.

## Names

- **Files and folders in kebab-case**, with a role suffix where the role isn't obvious:
  `sign-in.page.tsx`, `toast.store.ts`, `sign-in-with-google.service.ts`,
  `do-sign-in.action.ts`, `button.test.tsx`. Components (`button.tsx`) and hooks
  (`use-auth-user.ts`) need none. `check-file` enforces the case; the suffix is on you.
- **One exported declaration per file** (`exports/one-export-per-file`); the props interface lives
  with its component — `.claude/rules/one-export-per-file.md`.
- **Types** start with `I` (`IAccessStatus`), generics with `T` (`TValue`); **booleans** with
  `is/has/can/should/was` (`@typescript-eslint/naming-convention`) — `.claude/rules/self-explaining-code.md`.
- **Named exports only**, outside `src/app`.
- **Colors** only from the theme (`src/shared/theme`): a literal `#hex`, `rgb()` or `hsl()` fails the
  lint.

## Checking

```bash
pnpm mobile lint        # ESLint with the rules above
pnpm typecheck:mobile   # tsc --noEmit
```

The lint can't see a misplaced file that respects the import table, a missing role suffix or a local
component left inside another one's file. Those are on whoever writes and whoever reviews.
