---
name: forms
description: >-
  How a form works in apps/mobile: react-hook-form + Yup through useAppForm/createFormHook
  (validation on leaving a field), the required mark computed from the schema with the current
  values (isFieldRequired, the earlier app's way: .required(), .test(), .when()), the pt-BR Yup
  messages, and screen fields bound by control + name through createInputSmartWrapper
  (TextFieldSmart) and SmartRequiredMark instead of Controller. Use whenever building or changing a form, a field, a validation rule or a submit in
  apps/mobile. Triggers: "formulário", "campo", "validação", "schema", "Yup", "react-hook-form",
  "campo obrigatório", "mensagem de erro do campo", "submit".
---

# Forms in apps/mobile

## The form hook

Each form has a hook built by `createFormHook` (`src/shared/utils/form/createFormHook.ts`) from its
Yup schema and its initial values. The schema's type is the form's type:

```ts
// src/features/<feature>/pages/<PageName>/hooks/useOneOffBillForm/useOneOffBillForm.ts
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
`useAppForm` (`src/shared/hooks/useAppForm/useAppForm.ts`) wires the Yup resolver, validates when a
field is left and, after that, on every change (`mode: 'onTouched'`), and returns react-hook-form's
methods. Its `context` carries the question "is this field required?", which the bound fields ask
through the `control`.

## Required

A field is required when **the schema refuses its empty value with the form's current values**
(`isFieldRequired`, `src/shared/utils/form/isFieldRequired.ts`, the way the earlier app does it). So
the mark follows every rule, not only `.required()`:

- a `.test()` that refuses the empty value counts;
- a `.when()` follows the other field: `note` required only when `kind` is `outra`;
- a field inside a nested object or a list row (`installments.0.dueDate`) is answered too;
- a `.min()` alone doesn't count: Yup doesn't check an empty number.

A bound field asks with `isRequiredInForm(control, name)`. A label that covers a group of fields
uses `SmartRequiredMark` (`src/shared/components/inputs/SmartRequiredMark/`), which watches the
form so the `*` appears and disappears as the other fields change. The `*` is hidden from the screen
reader; the field itself announces "Campo obrigatório" in its accessibility hint.

## Messages

The Yup messages are in pt-BR for the whole app, set once by `src/core/yupLocale.ts`
(imported by `index.ts` and by the Jest setup). A field that needs another text passes it in the
schema: `string().required('Dê um nome à conta.')`. Never an English message, never a translation
key.

## Fields on the screen

A screen field is bound to the form by its **smart** version, made by `createInputSmartWrapper`
(`src/shared/utils/form/createInputSmartWrapper.tsx`). It reads the value, the change, the blur, the
error and the required mark from `control` and `name`:

```tsx
const { control, handleSubmit, formState } = useOneOffBillForm();

<TextFieldSmart control={control} name="name" label="Nome" />
```

- No `Controller` or `useController` in screens: the smart wrapper is the only place that binds.
- A new input type implements `IInputMinimalProps<TValue>` (`src/shared/types/form/InputMinimalProps.ts`:
  `value`, `onValueChange`, `onBlur`, `errorMessage`, `isRequired`, `disabled`) and gets its smart
  version in its own folder, `src/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart.tsx`:
  `export const MoneyFieldSmart = createInputSmartWrapper(MoneyField);`.
- The required mark comes from the schema, never from a prop typed by hand.

## Submit

```tsx
const onSubmit = handleSubmit(async (values) => {
  const { error } = await doSaveOneOffBill(values);
  if (!error) router.back();
});

<Button label="Salvar conta" onPress={onSubmit} isLoading={formState.isSubmitting} />
```

The action gives the feedback (skill `actions-and-feedback`).

## Testing

Test each distinct validation rule through the screen field (leave it empty, type a wrong value)
and the submit payload — see `src/shared/components/inputs/TextFieldSmart/TextFieldSmart.test.tsx`
and skill `testing`. `user.clear()` leaves the field, so it triggers the validation;
`user.type(..., { skipBlur: true })` doesn't. The `*` is hidden from accessibility, so Testing
Library only finds it with `{ includeHiddenElements: true }`; the required state is asserted on
the field's `accessibilityHint`.
