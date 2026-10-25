---
name: firestore-services
description: >-
  How apps/mobile reads and writes Firebase: the React Native Firebase 27 modular API only
  (getAuth/getFirestore/getStorage instances in src/shared/services/firebase), the emulator switch,
  one service per operation, realtime reads with createRealtimeService + useRealtime
  (subscribeToRefs waits for every ref), the find/get/ensure naming, every service's scenarios and
  contract test against the Firebase emulators (pnpm test:contract), the security rules in firebase/
  and how they are tested. Use whenever adding or changing a read, a write, a listener, a Firestore
  ref, a scenario, a contract test, a security rule or a Storage access in apps/mobile. Triggers:
  "Firestore", "Firebase", "lê do banco", "grava no banco", "tempo real", "onSnapshot", "cenário",
  "teste de contrato", "test:contract", "regra de segurança", "firestore.rules", "Storage",
  "emulador".
---

# Firestore services in apps/mobile

The data model is `docs/05-arquitetura/modelo-de-dados.dbml`: collection and field names come
from there.

## The instances

`src/shared/services/firebase/` holds one instance per product, built with the **modular API**:
`firebaseAuth` (`getAuth()`), `firestoreDb` (`getFirestore()`), `firebaseStorage` (`getStorage()`).
React Native Firebase 27 has no namespaced API (`firebase.firestore()`): never write it.

With `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`, each instance connects to its emulator on the PC
(`EMULATOR_HOST`, `10.0.2.2` from the Android emulator). The emulators run with
`pnpm firebase:emulators`, or inside the journeys' stack (`pnpm journeys:stack`).

## One service per operation

A service is one file, one Firebase operation, named after it with the `Service` suffix, in
`src/shared/services/<domain>/`, as in app-base:

```ts
// src/shared/services/recurringBill/deleteRecurringBillService.ts
export function deleteRecurringBillService(billId: string) {
  return deleteDoc(doc(firestoreDb, 'recurringBills', billId));
}
```

- A ref is built where it is used, with `doc`/`collection` and the collection name of the model; a
  ref shared by several services gets its own file (`recurringBillRef.ts`).
- Names (`.claude/rules/self-explaining-code.md`): a read that returns `null` when nothing is found
  starts with `find`; one that throws, with `get`; a check that throws, with `ensure`.
- Optional fields are written as `null`, never `undefined`: Firestore refuses `undefined`.
- A write that must be atomic (an entry and its file record) is one `writeBatch`; a read-then-write
  (a tag name that must stay unique) is one `runTransaction`.
- A query that combines a filter with an order, or filters on two fields, needs a composite index in
  production, and the emulator never asks for it: declare the index under `firebase/` in the same
  commit.
- Screens never call a service: they call an action (skill `actions-and-feedback`).
- Every service ships with its scenarios and its contract test, in the same commit
  ([Contract tests](#contract-tests)).

## Realtime reads

A screen that shows data listens to it. A query service, in `src/shared/services/<domain>/query/`,
declares the refs and how to join them with `createRealtimeService`
(`src/shared/utils/serviceUtils/createRealtimeService.ts`):

```ts
// src/shared/services/allowedEmail/query/allowedEmailQueryService.ts
export const allowedEmailQueryService = createRealtimeService({
  refs: ({ email }: { email: string | null }) =>
    email ? [doc(firestoreDb, 'allowedEmails', allowedEmailId(email))] : [],
  resolve: ([allowedEmail]) => allowedEmail !== null,
});
```

```ts
const { status, data: isAllowed } = useRealtime(allowedEmailQueryService, { email });
```

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

```ts
// As pessoas são as contas de teste das jornadas: Bruno está na lista, Carla não.
const BRUNO = 'bruno.souza@exemplo.com';
const CARLA = 'carla.lima@exemplo.com';
const BRUNO_IN_THE_LIST = { [`allowedEmails/${BRUNO}`]: { isAdmin: false, hasEntries: false } };

export const allowedEmailQueryScenarios = {
  emailOutsideList: { signedInAs: CARLA, given: BRUNO_IN_THE_LIST, input: { email: CARLA }, result: false },
  emailRemovedWhileOpen: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: { email: BRUNO },
    result: true,
    afterChange: { write: { [`allowedEmails/${BRUNO}`]: null }, result: false },
  },
} satisfies Record<string, IServiceScenario<{ email: string | null }, boolean>>;
```

- **`signedInAs`**: the account that calls, signed in through `signInWithFakeGoogleService`; `null`
  for no session.
- **`given`**: the documents written before, by path, with the rules off.
- **`input`**: a realtime read's params; a one-shot service's arguments, as a tuple (`[]` when it
  takes none), so a page test checks the call with `toHaveBeenCalledWith(...scenario.input)`.
- **`result`**: what the service delivers. An object keeps only the fields some screen reads, and the
  contract compares it with `toMatchObject`; a primitive with `toBe`, an array with `toEqual`.
- **`afterChange`**, realtime reads only: what changes in the database while the read is open
  (`null` deletes the document) and what the read delivers next.

A scenario holds what the service's contract can prove and a page can use. A case only the contract
cares about (the same account comes back with the same `uid`) is a plain `it` in the contract test.

### The contract test

```ts
describe('allowedEmailQueryService', () => {
  it.each(scenarioEntries(allowedEmailQueryScenarios))('Should deliver what the scenario %s says', async (_name, scenario) => {
    await arrangeScenario(scenario);
    const reading = listenTo(allowedEmailQueryService, scenario.input);

    expect(await reading.next()).toBe(scenario.result);
    if (scenario.afterChange) {
      await writeWithoutRules(scenario.afterChange.write);
      expect(await reading.next()).toBe(scenario.afterChange.result);
    }
  });
});
```

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
- **A new product** (Storage, for the receipts) gets its mapping and its contract instance with the
  first service that uses it.
- **Storage's `putFile` is a shim.** The contract maps `@react-native-firebase/storage` to a `putFile` that
  reads the file from disk and sends it with the JavaScript SDK's `uploadBytes`: it proves the rules and
  the batch, not the native upload (RNFB's own `putFile` and its retries), which only the device proves.

## Security rules

`firebase/firestore.rules` and `firebase/storage.rules` deny everything not opened explicitly. Each
rule carries a pt-BR comment with the business reason.

- **What a service does** is proven by its contract, which runs with the rules on: a rule change
  reruns `pnpm test:contract`.
- **What no service does, but someone with an account could try** through the SDK (read another
  person's entry, write to the allowed list) goes to `firebase/rules-tests/`
  (`@firebase/rules-unit-testing`, `node:test`), run with `pnpm test:rules`. One `*.test.mjs` per
  document and operation (`allowedEmails.update.test.mjs`) and `setup.mjs` with the emulator, the seed
  and the logins; the cases that only change the login or the field are a table of rows, one `it`
  each, and a new rule starts with its failing rows.

Both run in this container, against the emulators: Java comes from the PC through the claude-box.
