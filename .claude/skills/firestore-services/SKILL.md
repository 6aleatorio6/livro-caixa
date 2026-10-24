---
name: firestore-services
description: >-
  How apps/mobile reads and writes Firebase: the React Native Firebase 27 modular API only
  (getAuth/getFirestore/getStorage instances in src/shared/services/firebase), the emulator switch,
  one service per operation, realtime reads with createRealtimeService + useRealtime
  (subscribeToRefs waits for every ref), the find/get/ensure naming, the security rules in
  firebase/ and how they are tested. Use whenever adding or changing a read, a write, a listener, a
  Firestore ref, a security rule or a Storage access in apps/mobile. Triggers: "Firestore",
  "Firebase", "lê do banco", "grava no banco", "tempo real", "onSnapshot", "regra de segurança",
  "firestore.rules", "Storage", "emulador".
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
`pnpm firebase:emulators`.

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
- Screens never call a service: they call an action (skill `actions-and-feedback`).

## Realtime reads

A screen that shows data listens to it. A query service, in `src/shared/services/<domain>/query/`,
declares the refs and how to join them with `createRealtimeService`
(`src/shared/utils/serviceUtils/createRealtimeService.ts`):

```ts
// src/shared/services/allowedEmail/query/allowedEmailQueryService.ts
export const allowedEmailQueryService = createRealtimeService({
  refs: ({ emailId }: { emailId: string | null }) => (emailId ? [doc(firestoreDb, 'allowedEmails', emailId)] : []),
  resolve: ([allowedEmail]) => allowedEmail !== null,
});
```

```ts
const { status, data: isAllowed } = useRealtime(allowedEmailQueryService, { emailId });
```

`useRealtime` is in `src/shared/hooks/useRealtime/`, and the types (`IRealtimeState`, `IRefsData`…)
in `src/shared/types/realtime/`.

- `refs` returns a tuple; `resolve` receives each ref's data in the same order: a document as
  `{ id, ...data }` or `null`, a query as an array of them (`IRefsData`).
- `subscribeToRefs` delivers only when **every** ref has answered once, then on every change.
- An empty `refs` keeps the hook `idle` (a parameter is still missing).
- `status`: `idle`, `loading`, `cached` (from the device cache, may be behind the server),
  `success`, `error` (the hook already showed the toast).
- Changing the params (another month) closes the old listener and opens the new one; until the new
  one answers, the hook returns `loading`, never the old data.

## Security rules

`firebase/firestore.rules` and `firebase/storage.rules` deny everything not opened explicitly. Each
rule carries a pt-BR comment with the business reason. A rule change comes with its test in
`firebase/firestore.rules.test.mjs` (`@firebase/rules-unit-testing`, `node:test`), run with
`pnpm test:rules` against the emulator — on the PC, which has Java. Unit tests mock the modular
functions instead (skill `testing`).
