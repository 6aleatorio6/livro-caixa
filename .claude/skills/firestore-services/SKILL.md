---
name: firestore-services
description: >-
  How apps/mobile reads and writes Firebase: the React Native Firebase 27 modular API only
  (getAuth/getFirestore instances in src/shared/services/firebase), the emulator switch,
  one service per operation, realtime reads with createRealtimeService + useRealtime
  (subscribeToRefs waits for every ref), the find/get/ensure naming, every service's scenarios and
  contract test against the Firebase emulators (pnpm test:contract), the security rules in firebase/
  and how they are tested. Use whenever adding or changing a read, a write, a listener, a Firestore
  ref, a scenario, a contract test, a security rule or a receipt's bytes in apps/mobile. Triggers:
  "Firestore", "Firebase", "lê do banco", "grava no banco", "tempo real", "onSnapshot", "cenário",
  "teste de contrato", "test:contract", "regra de segurança", "firestore.rules", "comprovante", "fileContents",
  "emulador".
---

# Firestore services in apps/mobile

The data model is `docs/05-arquitetura/modelo-de-dados.dbml`: collection and field names come
from there.

## The instances

`@react-native-firebase/*` is imported only from `src/shared` (and from tests): the lint
(`boundaries/dependencies`) fails it in a feature, which calls a service. A page or component `.tsx`
imports no `*Service`, only a `*QueryService`; the `do*` action and the hook next to it import the
service.

`src/shared/services/firebase/` holds one instance per product, built with the **modular API**:
`firebaseAuth` (`getAuth()`) and `firestoreDb` (`getFirestore()`). React Native Firebase 27 has no
namespaced API (`firebase.firestore()`): never write it. There is no Cloud Storage: it needs the Blaze
plan, so a receipt's bytes live in Firestore, in `fileContents/{id}` (a `Bytes` field, up to 900 KiB),
next to its `files/{id}` record and written in the entry's batch (`addReceiptToBatch`,
`deleteReceiptFromBatch`). The record is read in realtime; the bytes only by the viewer, once.

With `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`, each instance connects to its emulator on the PC
(`EMULATOR_HOST`, the device's `127.0.0.1`, taken to the PC by `adb reverse`). The emulators run with
`pnpm firebase:emulators`, or inside the journeys' stack (`pnpm journeys:stack`).

## One service per operation

A service is one file, one Firebase operation, named after it with the `Service` suffix, in
`src/shared/services/<domain>/`, as in the earlier app:

```ts
// src/shared/services/recurringBill/deleteRecurringBillService.ts
export function deleteRecurringBillService(billId: string) {
  return deleteDoc(doc(firestoreDb, 'recurringBills', billId));
}
```

- A ref is built where it is used, with `doc`/`collection` and the collection name of the model; a
  ref shared by several services gets its own file (`recurringBillRef.ts`).
- Optional fields are written as `null`, never `undefined`: Firestore refuses `undefined`.
- A write that must be atomic (an entry and its file record) is one `writeBatch`; a read-then-write
  (a tag name that must stay unique) is one `runTransaction`.
- A query that combines a filter with an order, or filters on two fields, needs a composite index in
  production, and the emulator never asks for it: declare the index under `firebase/` in the same
  commit.
- Every service ships with its scenarios and its contract test, in the same commit
  ([Contract tests](#contract-tests)).

## Realtime reads

A screen that shows data listens to it. A query service, in `src/shared/services/<domain>/query/`,
declares the refs and how to join them with `createRealtimeService`
(`src/shared/utils/serviceUtils/createRealtimeService.ts`):

The real example is `src/shared/services/allowedEmail/query/allowedEmailQueryService.ts`: its `resolve`
returns `IAllowedEmail | null`, and `ChangeNamePage.tsx` reads it with
`useRealtime(allowedEmailQueryService, { email })`.

`useRealtime` is in `src/shared/hooks/useRealtime/`, and the types (`IRealtimeState`, `IRefsData`…)
in `src/shared/types/realtime/`.

- `refs` returns a tuple; `resolve` receives each ref's data in the same order: a document as
  `{ id, ...data }` or `null`, a query as an array of them (`IRefsData`).
- `subscribeToRefs` delivers only when **every** ref has answered once, then on every change.
- An empty `refs` keeps the hook `idle` (a parameter is still missing).
- `status`: `idle`, `loading`, `cached` (from the device cache, may be behind the server),
  `success`, `error` (no toast: the screen shows the error state, and the hook listens again by itself after 2 s, 5 s, 15 s, then every 30 s, while the screen is mounted).
- Changing the params (another month) closes the old listener and opens the new one; until the new
  one answers, the hook returns `loading`, never the old data.

## Contract tests

The equivalent of an endpoint test: the service runs for real against the Firebase emulators, with
the security rules, and must deliver what its scenarios say. Page tests mock the service only with
those scenarios (skill `testing`), so a mock never says what the service doesn't.

```
src/shared/services/allowedEmail/query/
├── allowedEmailQueryService.ts
├── allowedEmailQueryService.scenarios.ts       the cases: who calls, the database before, input, result
└── allowedEmailQueryService.contract.test.ts   runs each scenario against the emulators
```

### The scenarios

One object per service, each key a case named after the situation, typed by `IServiceScenario`
(`src/shared/types/testing/ServiceScenario.ts`). The people are the journeys' test accounts:

The real example is `src/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios.ts`:
`emailOutsideList` delivers `null`, `emailInList` delivers `BRUNO_PERSON`, and
`emailRemovedWhileOpen` ends on `null` through `afterChange`.

- **`signedInAs`**: the account that calls, signed in through `signInWithFakeGoogleService`; `null`
  for no session.
- **`given`**: the documents written before, by path, with the rules off.
- **`fileContentsGiven`**, receipt services only: the ids of the `fileContents` written before, with
  the contract's PNG bytes. The bytes stay out of `given` because a page test, which imports the
  scenario, can't load the native `Bytes`.
- **`input`**: a realtime read's params; a one-shot service's arguments, as a tuple (`[]` when it
  takes none), so a page test checks the call with `toHaveBeenCalledWith(...scenario.input)`.
- **`result`**: what the service delivers. An object keeps only the fields some screen reads, and the
  contract compares it with `toMatchObject`; a primitive with `toBe`, an array with `toEqual`.
- **`afterChange`**, realtime reads only: what changes in the database while the read is open
  (`null` deletes the document) and what the read delivers next.

A scenario holds what the service's contract can prove and a page can use. A case only the contract
cares about (the same account comes back with the same `uid`) is a plain `it` in the contract test.

### The contract test

The real example is
`src/shared/services/allowedEmail/query/allowedEmailQueryService.contract.test.ts`, and each
piece of it is explained below.

- **`it.each(scenarioEntries(scenarios))`**, so a new scenario is a new case with nothing else to
  write. `scenarioEntries` lists them by the general `IServiceScenario` type: the `satisfies` keeps
  each one's own type, and `it.each` would lose the `afterChange` and the input tuple.
- **`arrangeScenario(scenario)`** writes `given` with the rules off and signs in as `signedInAs`. Each
  test starts from an empty database and no session.
- **`listenTo(service, params)`** runs the app's own `subscribeToRefs` with the service's refs and
  queues what `resolve` returns from the server; `next()` waits for the next one. The read closes at
  the end of the test, even a failing one. A scenario with `afterChange` writes the change with
  `writeWithoutRules` and checks the following `next()`.
- **A one-shot service** is called with `...scenario.input` and its return compared with
  `scenario.result`. A write will also check the documents after it, as an endpoint test checks the
  database.
- **Every service has a contract.** `src/shared/services/serviceContracts.test.ts` fails when a
  `*Service.ts` has no `*.contract.test.ts` next to it, except the services on its list, each with
  the reason. A service lands there only when it can't run outside the phone (today,
  `signInWithGoogleService`: Google Sign-In is native).

### How it runs

`pnpm test:contract` starts emulators of its own (`firebase emulators:exec` with
`firebase/firebase.test.json`: other ports, no UI) in the project `demo-livro-caixa`, runs the tests
and stops them. A round takes about 20 seconds, mostly the emulators starting. It runs with the
journeys' stack up and never touches its accounts or data. Sharing the stack's emulators doesn't
work: the client SDK's Auth calls carry no project, so the Auth emulator files them under its default
project, the journeys' one. Running `pnpm mobile test:contract` alone refuses: without the
`emulators:exec`, the tests would fall on the stack's ports.

- **Jest with the `node` environment** (`apps/mobile/jest.contract.config.mjs`), not `jest-expo`. The
  regular `pnpm test:mobile` skips `*.contract.test.ts`. The emulators load `firebase/firestore.rules`
  when they start (`firebase/firebase.test.json`), and the tests read the project and the addresses
  from the variables `emulators:exec` sets.
- **The Firebase JavaScript SDK stands in for React Native Firebase.** RNFB only runs on the phone,
  and its web mode uses the lite SDK, which has no `onSnapshot`. The config maps
  `@react-native-firebase/{firestore,auth}` to `firebase/{firestore,auth}` (same modular functions)
  and the instances in `src/shared/services/firebase/` to the ones in
  `src/shared/testing/contract/firebase/`, connected to the emulators.
- **Each test starts clean**: no session, no Auth account (an existing account keeps the name of
  its first sign-in, so the next scenario would get it) and an empty database.
- **What differs from the phone.** The error code: RNFB prefixes the product
  (`firestore/permission-denied`), and the JavaScript SDK doesn't (`permission-denied`); Auth codes
  are `auth/…` in both. The device cache and when the native SDK flags data as cached. The Auth
  emulator stores the e-mail in lower case, even when the account signs in with capitals.
- **A new product** gets its mapping and its contract instance with the first service that uses it.
- **Expo's `File` is a shim.** The contract maps `expo-file-system` to a `File` that reads the
  receipt from disk (`base64()`, `size`): it proves the rules and the batch, not the native file read,
  which only the device proves.

## Security rules

`firebase/firestore.rules` denies everything not opened explicitly. Each
rule carries a pt-BR comment with the business reason.

- **What a service does** is proven by its contract, which runs with the rules on: a rule change
  reruns `pnpm test:contract`.
- **What no service does, but someone with an account could try** through the SDK (read another
  person's entry, write to the allowed list) goes to `firebase/rules-tests/`
  (`@firebase/rules-unit-testing`, `node:test`), run with `pnpm test:rules`. One `*.test.mjs` per
  document and operation (`allowedEmails.update.test.mjs`) and `setup/` with the emulator and the seed
  (`environment.mjs`), the logins (`profiles.mjs`), the refs, documents, batches and row helpers, all
  re-exported by `setup/index.mjs`; the cases that only change the login or the field are a table of rows, one `it`
  each, and a new rule starts with its failing rows.
- **A hand mutation** (the red of a denial, which passes from the start against a default-deny
  system) runs only the tests it should break, against one emulator kept up. The `before` of
  `setup/environment.mjs` sends `firebase/firestore.rules` from disk to the emulator on every run,
  so the mutated rule reaches it without a restart. From the repository root, start the emulator
  once, as a background command, then for each mutation edit the rule, run, and revert:

  ```sh
  pnpm exec firebase -c firebase/firebase.test.json emulators:start --only firestore --project demo-livro-caixa
  FIRESTORE_EMULATOR_HOST=127.0.0.1:8180 node --test --test-concurrency=1 \
    --test-name-pattern='<the titles it should break>' firebase/rules-tests/<file>.test.mjs
  ```

  Measured on 2026-11-21, one mutation that breaks 2 tests: 31.7 s through `emulators:exec` with
  the section's two files (136 tests), 9.4 s through `emulators:exec` with `--test-name-pattern`
  on one file, and against the emulator already up 4.4 s on the first run and ~1.9 s after. The
  `#33`'s 43 mutations took ~26 min the first way.
  - The pattern is a regex: a `.` or `+` in a title matches more, a `(` turns into a group and an
    unbalanced one aborts the run. A pattern that matches nothing still reports `# tests 1`, the
    file itself, with `# suites 0`: with the mutation applied, `# fail` must equal the number of
    titles you meant.
  - At the end, stop the emulator with `pkill -f '[e]mulators:start'`, in a command of its own
    (with the start in the same command line, the pattern matches that shell too), and check that
    `ss -ltn | grep -E ':8180|:4410'` comes back empty. The same command clears one a dead
    subagent left up: it holds the ports of `pnpm test:rules` and `pnpm test:contract`.

