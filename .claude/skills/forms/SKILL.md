---
name: forms
description: >-
  How a form works in apps/mobile: react-hook-form + Yup through useAppForm/createFormHook (the
  required fields come from the schema, validation on leaving a field), the pt-BR Yup messages,
  and screen fields bound to the form by createInputSmartWrapper (TextFieldSmart) instead of
  Controller. Use whenever building or changing a form, a field, a validation rule or a submit in
  apps/mobile. Triggers: "formulário", "campo", "validação", "schema", "Yup", "react-hook-form",
  "campo obrigatório", "mensagem de erro do campo", "submit".
---

# Forms in apps/mobile

## The form hook

Each form has a hook built by `createFormHook` (`src/shared/forms/create-form-hook.ts`) from its
Yup schema and its initial values. The schema's type is the form's type:

```ts
// src/modules/<module>/pages/<page>/hooks/use-one-off-bill-form.ts
const oneOffBillSchema = object({
  name: string().required(),
  amountCents: number().required().min(1),
  date: string().required(),
  tagId: string().optional(),
});

export const useOneOffBillForm = createFormHook(oneOffBillSchema, {
  name: '',
  amountCents: 0,
  date: todayDate(),
});
```

The schema stays in the hook's file, as a value constant (`.claude/rules/one-export-per-file.md`).
`useAppForm` (`src/shared/forms/use-app-form.ts`) wires the Yup resolver, validates when a field is
left and, after that, on every change (`mode: 'onTouched'`), and returns react-hook-form's methods
plus `requiredFieldNames`, read from the schema.

## Messages

The Yup messages are in pt-BR for the whole app, set once by `src/shared/forms/yup-locale.ts`
(imported by `index.ts` and by the Jest setup). A field that needs another text passes it in the
schema: `string().required('Dê um nome à conta.')`. Never an English message, never a translation
key.

## Fields on the screen

A screen field is bound to the form by its **smart** version, made by `createInputSmartWrapper`
(`src/shared/forms/create-input-smart-wrapper.tsx`). It reads the value, the change, the blur, the
error and the required mark from `form` and `name`:

```tsx
const form = useOneOffBillForm();

<TextFieldSmart form={form} name="name" label="Nome" />
```

- No `Controller` or `useController` in screens: the smart wrapper is the only place that binds.
- A new input type implements `IInputMinimalProps<TValue>` (`value`, `onValueChange`, `onBlur`,
  `errorMessage`, `isRequired`, `disabled`) and gets its smart version in its own file:
  `export const MoneyFieldSmart = createInputSmartWrapper(MoneyField);`.
- The required mark (`Nome *`) comes from the schema, never from a prop typed by hand.

## Submit

```tsx
const onSubmit = form.handleSubmit(async (values) => {
  const { error } = await doSaveOneOffBill(values);
  if (!error) router.back();
});

<Button label="Salvar conta" onPress={onSubmit} isLoading={form.formState.isSubmitting} />
```

The action gives the feedback (skill `actions-and-feedback`).

## Testing

Test each distinct validation rule through the screen field (leave it empty, type a wrong value)
and the submit payload — see `src/shared/components/text-field-smart.test.tsx` and skill `testing`.
`user.clear()` leaves the field, so it triggers the validation; `user.type(..., { skipBlur: true })`
doesn't.
