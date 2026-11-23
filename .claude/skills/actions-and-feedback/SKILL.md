---
name: actions-and-feedback
description: >-
  How apps/mobile gives feedback around an async operation: createAsyncAction (loader, success and
  error toasts, a { data, error } result that never throws), AppError with a developer message and
  a pt-BR user message, the toast and loader stores with their show/hide functions, and where an
  action file lives. Use whenever a screen calls a service (save, pay, sign in, delete), when adding
  an error the person must understand, or when touching the toast or the fullscreen loader.
  Triggers: "ação assíncrona", "mostra um aviso", "toast", "loader", "carregando", "mensagem de
  erro", "AppError", "createAsyncAction", "do*".
---

# Actions and feedback in apps/mobile

## The action

A screen never calls a service directly: it calls an **action** built with `createAsyncAction`
(`src/shared/utils/handlerError/createAsyncAction.ts`), which gives the person the feedback and never
throws.

```ts
// src/features/<feature>/pages/<PageName>/utils/actions/doPayBill.ts
export const doPayBill = createAsyncAction({
  run: (payment: IPaymentDraft) => payBillService(payment),
  shouldShowLoader: true,
  successMessage: 'Pagamento registrado',
});
```

```tsx
const { data, error } = await doPayBill(payment);
if (error) return;          // the toast already told the person
router.back();
```

| Option | Use when |
|---|---|
| `run` | always: the service call, with the params the action receives |
| `shouldShowLoader` | the person must wait and can't do anything else meanwhile (a save, an upload) |
| `successMessage` | the result isn't visible on its own (a save that closes the screen) |
| `successAction` | the success toast carries a button, chosen from the call's params and result (`(params, data) => { label, onPress }`); needs `successMessage` |

```ts
// src/features/home/utils/actions/doSkipOverdueMonth.ts
export const doSkipOverdueMonth = createAsyncAction({
  run: skipOverdueMonthService,
  shouldShowLoader: true,
  successMessage: ({ bill, month }) => `${bill.name} de ${monthName(month)} pulada.`,
  successAction: ({ bill, month }) => ({
    label: 'Desfazer',
    onPress: () => {
      doUndoSkipOverdueMonth({ bill, month });
    },
  }),
});
```

On failure the action shows `errorUserMessage(error)` as an error toast and returns
`{ data: null, error }`. It hides the loader in every outcome.

A cancel that isn't an error (the person closed the Google account picker) is not thrown: the
service returns `null`, and the action returns `{ data: null, error: null }` without a toast.

## The error the person reads

`AppError` (`src/shared/exceptions/AppError.ts`) is an expected error: its `message`, in English, is
for whoever develops; its `userMessage`, in pt-BR, is what the toast shows
(`.claude/rules/code-language.md`).

```ts
throw new AppError('Payment already registered for this month', 'Essa conta já foi paga neste mês.');
```

Any other error shows the generic "Algo deu errado. Tente de novo." through `errorUserMessage`
(`src/shared/utils/handlerError/errorUserMessage.ts`). A known library error code that the person should
understand (a Firebase Auth code) gets its pt-BR text in that function's lookup table, not in the
screen.

## The global feedback

The toast and the fullscreen loader (`AppToast` and `FullscreenLoaderModal`, in `src/core/components/`)
are mounted once, by `AppContainer` (`src/core/AppContainer.tsx`), and change only through their
functions in `src/core/utils/storeActions/`:

| Function | Effect |
|---|---|
| `showToast(message, kind, action?)` | shows the toast (`'success'` or `'error'`) and hides it after 4 s, or 6 s when it has an `action` (`{ label, onPress }`, the "Desfazer" button); a new toast replaces the old one and restarts the time |
| `hideToast()` | hides it now and clears the timer that would hide it later |
| `showLoader()` / `hideLoader()` | covers and uncovers the screen |

Pressing the action's button runs its `onPress` and closes the toast. Outside an action, call these
functions; never `useToastStore.setState` from a screen. The stores live in `core` with the components
that show them, so `core` never imports from `shared`.

## Testing

Test the action through its result and the stores' state (`useToastStore.getState()`), with fake
timers so the toast's auto-hide doesn't outlive the test — see
`src/shared/utils/handlerError/createAsyncAction.test.ts` and skill `testing`.
