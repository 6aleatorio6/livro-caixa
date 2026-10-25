---
name: testing
description: >-
  How to write the tests of apps/mobile (Jest with jest-expo and React Native Testing Library 14):
  which layer a behavior goes to (unit, page, contract, rules), page tests whose mocks of useRealtime,
  useAuthState and the services come only from contract-verified scenarios (mockRealtime,
  mockServiceScenario), what deserves a test and what doesn't, how to find the cases from the branches
  and the expected value from the business rule, the edge cases the code itself points to, describe/it
  naming, queries and interactions, render factories, and mocking Firebase in the code that wraps it.
  Use whenever adding or editing a *.test.ts or *.test.tsx in apps/mobile, and when a section of a plan
  says which tests it adds. Triggers: "escreve o teste", "testa isso", "falta teste", "o teste
  quebrou", "teste de página", "mocka o serviço", "jest", "RNTL".
---

# Testing apps/mobile

The strategy is the documentation's "Testes" page (`docs/05-arquitetura/03-testes.md`). A behavior goes
to the cheapest layer that proves it:

| Layer | Proves | Lives | Runs with |
|---|---|---|---|
| Unit | a decision of the app's own code: a pure function, a hook, a component, the code that wraps Firebase | next to the code | `pnpm test:mobile` |
| Page | what a person sees and does on a screen, with `useRealtime`, `useAuthState` and the services mocked from scenarios | next to the page; a route's in `__tests__/app/` | `pnpm test:mobile` |
| Contract | what each service really returns from the Firebase emulators, scenario by scenario | next to the service — skill `firestore-services` | `pnpm test:contract` |
| Rules | what no service does but someone with an account could try | `firebase/rules-tests/` | `pnpm test:rules` |

The journeys are not a layer. They are the developer testing by hand (skill `app-journeys`): a bug one
finds becomes a failing test in the cheapest layer that reproduces it, before the fix.

Tests live next to the code: `Button.tsx` → `Button.test.tsx`. They come with the code they cover,
in the same commit (skill `commit-convention`).

**Except under `src/app`:** Metro bundles every file there as a route, so a test there breaks the
app (`expo-router/testing-library` imports Node's `path`). A route's or layout's test goes to
`apps/mobile/__tests__/app/`, mirroring the path: `src/app/_layout.tsx` →
`__tests__/app/_layout.test.tsx`.

**Before writing a test, answer: what bug would it catch?** No answer, no test.

## What not to test

| Never | Why |
|---|---|
| A component with no logic (a text, an icon, a layout wrapper) | It tests that React renders |
| "Renders without crashing" | It tests `createElement`, not the code |
| Static copy on a screen | A copy change is not a bug |
| The library's contract (react-hook-form, Firestore, expo-router) | It tests the library |
| Internals: state shape, calls between private helpers | It breaks on refactor and tests the *how* |
| A service with the Firebase functions mocked | It repeats the code; the contract runs the service for real |

## What to test

| What | Test | Skip |
|---|---|---|
| Page | what the person sees for each scenario the page reads; what a press calls, with the scenario's input; a change while the screen is open | what the service returns for each input: the contract proves it |
| Service | its contract: every scenario against the emulators (skill `firestore-services`) | — |
| Component | user interactions; props that change what is seen (conditional render, disabled, error) | static render |
| Form hook | each distinct validation rule; the valid submit payload | the empty initial state |
| Store, timer | the state after an action; transitions by timer; the edge state (a toast already visible) | the initial shape |
| Pure function (a decision, a calculation) | every branch | — |

## Page tests

A page test renders the screen, or the root layout with its routes, and checks what the person sees
and what a press calls. `useRealtime`, `useAuthState` and the services are mocked, and **every value
a mock returns comes from a scenario** (`<service>.scenarios.ts`, next to the service). The service's
contract test runs the same scenario against the Firebase emulators, so a mock only says what the
real service was seen saying.

A case the page needs that no scenario has yet (a month with no entries) is a new scenario first, in
the service's folder: the contract runs it before the page uses it.

The helpers live in `src/shared/testing/`.

**Every mock in a page test has a factory**: `jest.mock(path, () => ({ … }))`. A `jest.mock(path)`
without one loads the real module to copy its shape, the real module loads React Native Firebase,
and Jest stops with "Native module NativeRNFBTurboApp is not registered". That includes the module of
each realtime service the screen reaches: its object only needs to exist, because `mockRealtime`
recognizes the service by identity.

### A realtime read

```tsx
jest.mock('@/shared/hooks/useRealtime/useRealtime', () => ({ useRealtime: jest.fn() }));
jest.mock('@/shared/services/allowedEmail/query/allowedEmailQueryService', () => ({ allowedEmailQueryService: {} }));

const realtime = mockRealtime({
  service: allowedEmailQueryService,
  scenario: allowedEmailQueryScenarios.emailRemovedWhileOpen,
});
await renderRouter(routes);
expect(screen.getByText('Início')).toBeOnTheScreen();

await act(async () => realtime.applyChange(allowedEmailQueryService));

expect(await screen.findByText('Sem acesso')).toBeOnTheScreen();
```

- **Each entry is a service** with a scenario, which delivers `{ status: 'success', data:
  scenario.result }`, or with a status alone (`idle`, `loading`, `error`), which carries no data.
- **The params the page passes must equal the scenario's `input`.** A page that reads with the wrong
  e-mail or month fails the test with the `toEqual` diff between the two. A read with no entry fails
  too ("O useRealtime não tem mock para a leitura com …").
- **`applyChange(service)`**, inside `act`, makes the hook deliver `scenario.afterChange.result`: the
  screen that reacts while open.
- **`cached` is not mocked here.** It is a decision of `useRealtime` and of who reads it
  (`accessStatusFor`), unit-tested there.

### A service the page calls

```tsx
jest.mock('@/shared/services/auth/signInWithFakeGoogleService', () => ({ signInWithFakeGoogleService: jest.fn() }));

const scenario = signInWithFakeGoogleScenarios.memberSignsIn;
mockServiceScenario(signInWithFakeGoogleService, scenario);
await render(<TestSignInPage />);

expect(signInWithFakeGoogleService).toHaveBeenCalledWith(...scenario.input);
```

The mock resolves with `scenario.result`, and **the test checks the call**, never the mock itself:
`createAsyncAction` catches what a service throws and shows a toast, so a check that throws inside the
mock would leave the test green. A service with no input (`input: []`) is checked with
`toHaveBeenCalledTimes(1)`: `createAsyncAction` calls it with one `undefined` argument, which
`toHaveBeenCalledWith()` doesn't match.

A service that refuses (`AppError`) is mocked with its rejected scenario, the one the contract saw
the service throw: `mockServiceRejection(createTagService, createTagRejectedScenarios.nameOfAnotherTag)`.
Never an `AppError` built by hand in the test.

### The session

`useAuthState` is mocked too, and `signedInAuthState` builds the session from a sign-in scenario,
whose `result` the contract proves the Auth emulator returns:

```tsx
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));

jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.outsiderSignsIn));
```

The scenario holds only the fields some screen reads. A screen that reads another field gets
`undefined` in the test, and the field goes into the scenario, where the contract checks it.

### A service with no contract

A service on the exception list of `src/shared/services/serviceContracts.test.ts` is mocked with
values written in the test, under a comment saying why. Today the list has one:
`signInWithGoogleService`, because Google Sign-In is native and a person checks the real sign-in.

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

Only the code that wraps Firebase mocks its modular functions: `subscribeToRefs`, `useRealtime`,
`useAuthState`. These tests check the app's own logic over what Firebase delivers (wait for every ref,
the cache flag, stop on an error), with snapshots built in the test. A service is never tested this
way: its contract runs it against the emulators.

```ts
import { onSnapshot } from '@react-native-firebase/firestore';

jest.mock('@react-native-firebase/firestore', () => ({ onSnapshot: jest.fn() }));

function documentSnapshot(id: string, data: object | null, isFromCache = false) {
  return { id, exists: () => data !== null, data: () => data, metadata: { fromCache: isFromCache } };
}

beforeEach(() => {
  jest.clearAllMocks();
});
```

A snapshot shape the native SDK delivered and broke the app (found in a journey) becomes one of these
tests, with that exact shape.
