---
name: project-structure
description: >-
  Where each file of apps/mobile lives and how it is named, following the earlier app's structure: the
  four layers of src/ (app, features, shared, core) and what each may import, the folder of a
  feature and of a page, the file names (PascalCase for components, pages and types, camelCase for
  hooks, functions and services), and what apps/mobile/eslint.config.mjs already enforces. Use
  before creating a file, folder, screen, feature, hook, store, service, type or component in
  apps/mobile, when moving one, and when the lint reports boundaries/dependencies, check-file or
  one-export-per-file. Triggers: "cria a tela", "nova feature", "onde coloco", "nova pasta", "novo
  hook", "novo serviço", "boundaries/dependencies", "não pode importar".
---

# Project structure of apps/mobile

The structure follows the earlier app's. All paths below are relative to `apps/mobile/`. Imports use the
`@/` alias for `src/`.

## The four layers

```
src/
├── app/        routes (expo-router): each file only re-exports a page
├── features/   one folder per domain: auth, home…
├── shared/     what several features use: components, hooks, services, utils, types, exceptions
└── core/       the app's infrastructure: the theme, AppContainer and the global components (toast,
                loader, splash), the global stores and their actions, Google Sign-In and Yup setup
```

```
app ──► features ──► shared ──► core
```

| Layer | May import | Never imports |
|---|---|---|
| `app` | `features`, `shared`, `core` | — |
| `features/<f>` | its own feature, `shared`, `core` | `app`, another feature |
| `shared` | `shared`, `core` | `app`, `features` |
| `core` | `core` | `app`, `features`, `shared` |

`eslint-plugin-boundaries` enforces this table (`boundaries/dependencies`), and `import-x/no-cycle`
forbids cycles. When a feature needs something from another one, that piece belongs in `shared`.
`core` is the bottom: a core component styles itself from the theme (`AppToast` uses the theme's
typography, not `AppText`, which is in `shared`).

## A route

A file in `src/app/` follows expo-router's names (`_layout.tsx`, `[id].tsx`, `(auth)/`,
`+not-found.tsx`) and is the only place with `export default`:

```ts
export { SignInPage as default } from '@/features/auth/pages/SignInPage/SignInPage';
```

The root `_layout.tsx` holds the guards — skill `protected-navigation`.

## A feature

```
src/features/<feature>/
├── pages/<PageName>/
│   ├── <PageName>.tsx            the screen
│   ├── <PageName>.test.tsx
│   ├── components/               used only by this page
│   ├── hooks/
│   └── utils/actions/            do*.ts: the async actions the screen fires
├── components/                   shared by the feature's pages
├── hooks/
├── constants/
└── utils/                        pure functions of the domain
```

Firebase access doesn't live in the feature: it is in `shared/services/<domain>/`, one file per
operation (skill `firestore-services`). Folders appear when their first file does. Where a piece
goes depends on **who uses it**:

| Used by | Goes to |
|---|---|
| one page | `pages/<PageName>/components` (or `hooks`, `utils`) |
| the pages of one feature | `features/<feature>/components` (or `hooks`, `utils`) |
| more than one feature | `shared/components` (or `hooks`, `utils`…) |

When a second user appears, move the piece up one level in the same commit.

### Pages that share a layout: the route group

When some pages of a feature share a layout (a details shell with tabs over the same bill, a header
with data they all read) and other pages of the same feature stay outside it, the covered pages go
into a **route group**: a folder named `(GroupName)` inside `pages/`, holding the layout and what
the group shares. The convention comes from an earlier project.

```
features/recurringBills/pages/
├── RecurringBillsListPage/               outside the layout
└── (RecurringBillDetails)/
    ├── RecurringBillDetailsLayout.tsx    exports RecurringBillDetailsLayout
    ├── hooks/                            what only the group's pages use
    ├── RecurringBillOverviewPage/
    └── RecurringBillPaymentsPage/
```

- **The group folder is `(PascalCase)`**, like the pages around it.
- **The layout component is named `*Layout`, never `*Page`.** It renders the navigator of its child
  routes (`<Stack />` or `<Slot />` from expo-router) around what they share.
- **Child pages are direct children of the group**: no `pages/` folder inside it.
- **What the group's pages share sits next to the layout**, never inside one of the pages.
- **A group only exists when something stays outside it**: a group holding every page of the
  feature is redundant, and its contents belong in `pages/`. **A layout only exists when it is
  shared**: a standalone page has none.
- **In the feature, the parentheses mean nothing to the router.** expo-router finds layouts by file
  name in `src/app`, so the route's `_layout.tsx` re-exports the feature's layout:
  `src/app/recurring-bills/[billId]/_layout.tsx` →
  `export { RecurringBillDetailsLayout as default } from '@/features/recurringBills/pages/(RecurringBillDetails)/RecurringBillDetailsLayout';`.
  Inside `src/app`, a `(group)` folder is expo-router's own route group (no URL segment), used for
  navigation that crosses features, such as the tab bar.

## Shared and core

| Folder | Holds |
|---|---|
| `shared/components/<Name>/` | the design-system components, each in its folder with its test; inputs in `shared/components/inputs/<Name>/` |
| `shared/hooks/<useName>/` | each hook in its folder: `useRealtime`, `useAuthState`, `useAppForm` |
| `shared/services/` | `firebase/` (the instances) and `<domain>/` (one operation per file; realtime reads in `<domain>/query/`) |
| `shared/utils/` | factories and pure functions, grouped: `handlerError/`, `serviceUtils/`, `form/` |
| `shared/types/<group>/` | every type that isn't a component's props |
| `shared/exceptions/` | `AppError` |
| `core/theme/` | the Unistyles themes and their configuration |
| `core/components/<Name>/` | the components mounted once by `AppContainer` |
| `core/store/` and `core/utils/storeActions/` | the global stores (toast, loader) and the functions that change them |
| `core/types/` | the types of `core` |

## Names

- **The file carries the name of what it exports**, with no hyphen: a component, page or class in
  PascalCase (`Button.tsx`, `SignInPage.tsx`, `AppError.ts`); a function, hook or service in
  camelCase (`createAsyncAction.ts`, `useRealtime.ts`, `signInWithGoogleService.ts`); a type in
  PascalCase without the `I` (`RealtimeState.ts` exports `IRealtimeState`); a store as
  `<name>.store.ts`. Folders are camelCase, except a component's or page's, named after it, and a
  route group's `(PascalCase)`.
- **One exported declaration per file** (`exports/one-export-per-file`); the props interface lives
  with its component — `.claude/rules/one-export-per-file.md`.
- **Suffixes:** `*Service` for a Firebase operation, `*QueryService` for a realtime read, `do*` for
  an action, `use*` for a hook.
- **Types** start with `I` (`IAccessStatus`), generics with `T` (`TValue`); **booleans** with
  `is/has/can/should/was` (`@typescript-eslint/naming-convention`) — `.claude/rules/self-explaining-code.md`.
- **Named exports only**, outside `src/app`.
- **Colors** only from the theme (`src/core/theme`): a literal `#hex`, `rgb()` or `hsl()` fails the
  lint.

## Checking

```bash
pnpm mobile lint        # ESLint with the rules above
pnpm typecheck:mobile   # tsc --noEmit
```

The lint checks the case of files (PascalCase for components, pages and types, camelCase for
hooks, services, utils and stores), folders with no hyphen (or a `(Group)` folder), the layers, one
export per file and the names. It
can't see a file named after the wrong export, a misplaced file that respects the layers, or a
local component left inside another one's file: those are on whoever writes and whoever reviews.
