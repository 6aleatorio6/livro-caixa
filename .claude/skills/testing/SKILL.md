---
name: testing
description: >-
  How to write the tests of apps/mobile (Jest with jest-expo and React Native Testing Library 14):
  what deserves a test and what doesn't, how to find the cases from the branches and the expected
  value from the business rule, the edge cases the code itself points to, describe/it naming,
  queries and interactions, render factories, and mocking Firebase. Use whenever adding or editing
  a *.test.ts or *.test.tsx in apps/mobile, and when a section of a plan says which tests it adds.
  Triggers: "escreve o teste", "testa isso", "falta teste", "o teste quebrou", "jest", "RNTL".
---

# Testing apps/mobile

Tests live next to the code: `Button.tsx` → `Button.test.tsx`. They come with the code they cover,
in the same commit (skill `commit-convention`). Run them with `pnpm test:mobile`.

**Before writing a test, answer: what bug would it catch?** No answer, no test.

## What not to test

| Never | Why |
|---|---|
| A component with no logic (a text, an icon, a layout wrapper) | It tests that React renders |
| "Renders without crashing" | It tests `createElement`, not the code |
| Static copy on a screen | A copy change is not a bug |
| The library's contract (react-hook-form, Firestore, expo-router) | It tests the library |
| Internals: state shape, calls between private helpers | It breaks on refactor and tests the *how* |

## What to test

| Unit | Test | Skip |
|---|---|---|
| Service | the exact arguments of the Firebase calls; the guard paths (`not.toHaveBeenCalled`, `rejects.toThrow`) | how refs are built |
| Component | user interactions; props that change what is seen (conditional render, disabled, error) | static render |
| Form hook | each distinct validation rule; the valid submit payload | the empty initial state |
| Store, timer | the state after an action; transitions by timer; the edge state (a toast already visible) | the initial shape |
| Pure function (a decision, a calculation) | every branch | — |

## Finding the cases and the expected value

Two different questions:

- **Which cases?** Read the code: every `if`/`else`, `&&`, `||`, early return, ternary and
  `.find`/`.filter` is a place where the logic forks. Each fork is a case.
- **What should the `expect` say?** Read the **business rule** (`docs/`), never the code.

An `expect` derived from the implementation only photographs what the code does, bug included: it
passes by construction. Write each expected value from the rule before looking at what the code
returns. When the rule and the code disagree, the code is wrong; fix it, don't bend the test.

Example — the access decision after login. The code forks on "no user", "loading" and "document
exists"; the rule (`docs/03-funcionalidades/02-suporte/01-acesso.md`) says a Google e-mail outside
the allowed list sees the no-access screen:

| Case (from the code) | Expected (from the rule) | `it` |
|---|---|---|
| no signed-in user | sign-in screen | `Should send a signed-out person to sign-in` |
| user, list document exists | the app | `Should let an allowed e-mail in` |
| user, no list document | no-access screen | `Should stop an e-mail outside the allowed list` |

## Edges the code points to

| Signal in the code | Edge to test |
|---|---|
| `if (!x) return` | call with `x` falsy → `not.toHaveBeenCalled()` |
| `list[list.length - 1]`, `index === 0` | empty list; first and last item |
| `await` inside a handler | the state **before** it resolves (a second press, a spinner) |
| a value normalized somewhere (`toLowerCase()`, `trim()`) | the input that needs it (`Ana@Gmail.com`) |

The state before an `await`, with a promise resolved by hand:

```tsx
let resolveSignIn!: () => void;
const signIn = jest.fn(() => new Promise<void>((resolve) => { resolveSignIn = resolve; }));
// …press the button twice…
expect(signIn).toHaveBeenCalledTimes(1);
resolveSignIn();
```

## Names

- `describe` carries the name of the unit under test (`'Button'`, `'createAsyncAction'`,
  `'useAccess'`) or the subject in English (`'Sign-in'`).
- `it` **always starts with "Should"** and says what should happen, in English:
  `it('Should not call onPress while disabled')` — `.claude/rules/code-language.md`.
- Nest a `describe` only to group 3+ cases with the same trigger (`describe('When the e-mail is
  removed from the list')`).
- Every `it` is Arrange → Act → Assert, and asserts what is visible (the screen, the callback
  payload), never internal state.

## Queries and interactions

In Testing Library 14, `render` and `renderHook` return a promise: await them. Use `screen`, never what `render` returns. Query
priority: `getByRole` › `getByLabelText` › `getByPlaceholderText` › `getByText` › `getByTestId`.

```tsx
await render(<Button label="Entrar com Google" onPress={onPress} />);

const user = userEvent.setup();
await user.press(screen.getByRole('button', { name: 'Entrar com Google' }));

expect(screen.getByText('Você não tem acesso')).toBeOnTheScreen(); // not toBeTruthy()
expect(screen.queryByRole('alert')).toBeNull();                    // absence
const toast = await screen.findByRole('alert');                    // async: not waitFor + getBy
```

`userEvent` for real interactions; `fireEvent` only for an event `userEvent` doesn't support.

## Render factory

When 2+ tests repeat the same render, extract **one** factory with the happy-path defaults and **an
overrides object** (never positional parameters). It returns the mocks the test asserts on.

```tsx
async function renderButton(overrides: { disabled?: boolean; isLoading?: boolean } = {}) {
  const onPress = jest.fn();
  await render(<Button label="Entrar com Google" onPress={onPress} {...overrides} />);
  return { onPress };
}
```

## Mocking Firebase

Mock the modular functions the service calls, one `jest.mock` per package, and clear the mocks
first in `beforeEach`:

```ts
import { getDoc } from '@react-native-firebase/firestore';

jest.mock('@react-native-firebase/firestore', () => ({
  doc: jest.fn((_db, ...path: string[]) => path.join('/')),
  getDoc: jest.fn(),
  getFirestore: jest.fn(() => ({})),
}));

beforeEach(() => {
  jest.clearAllMocks();
});
```

Assert the path and the payload the service sends (`expect(setDoc).toHaveBeenCalledWith(...)`), and
the guard paths. Rules of the Firestore and Storage security files are tested against the
emulators, not with mocks.
