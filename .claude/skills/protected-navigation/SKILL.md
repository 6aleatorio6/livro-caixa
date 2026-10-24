---
name: protected-navigation
description: >-
  How apps/mobile decides which screens a person reaches: the access status from useAccess
  (loading, signedOut, denied, allowed), the Stack.Protected guards in the root _layout, the splash
  screen held while the session loads, and how to add a screen under the right guard or test the
  guards with renderRouter. Use whenever adding a route, changing who sees a screen, touching the
  sign-in, the no-access screen or the root layout, or when a screen flashes or appears to the
  wrong person. Triggers: "rota protegida", "nova tela", "quem vê essa tela", "tela de login",
  "sem acesso", "Stack.Protected", "guard", "splash", "a tela de login pisca".
---

# Protected navigation in apps/mobile

Screens are reachable by **guards**, not by redirects: `Stack.Protected` (expo-router) in
`src/app/_layout.tsx` opens a group of screens while its `guard` is true. When the status changes,
expo-router removes the screens that closed from the history and shows the first one that opened.
No screen navigates by hand after a sign-in or a sign-out.

## The access status

`useAccess` (`src/features/auth/hooks/useAccess/useAccess.ts`) joins the Firebase session
(`useAuthState`) with the person's entry in the allowed list (`allowedEmailQueryService`) into one
`IAccessStatus`, decided by the pure function `accessStatusFor`
(`src/features/auth/utils/accessStatusFor.ts`):

| Status | Screen |
|---|---|
| `loading` | the splash screen, over `sign-in` |
| `signedOut` | `sign-in` |
| `denied` | `no-access`: the Google e-mail isn't on the list |
| `allowed` | the app |

A denial only comes from the server: offline, with the e-mail missing from the device cache, the
status stays `loading` instead of sending someone with access to `no-access`. The e-mail is
compared lowercased (`allowedEmailId`), because the list's document ids are.

## The root layout

```tsx
<SplashScreenController isLoading={accessStatus === 'loading'} />
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Protected guard={accessStatus === 'signedOut' || accessStatus === 'loading'}>
    <Stack.Screen name="sign-in" />
  </Stack.Protected>
  <Stack.Protected guard={accessStatus === 'denied'}>
    <Stack.Screen name="no-access" />
  </Stack.Protected>
  <Stack.Protected guard={accessStatus === 'allowed'}>
    <Stack.Screen name="index" />
  </Stack.Protected>
</Stack>
```

- The navigator is always rendered, as in the expo-router authentication guide. While the status is
  `loading`, the splash (`SplashScreenController`, `src/core/components/`) covers the sign-in
  screen, and it hides only when the status settles: a signed-in person never sees the sign-in
  screen flash.
- **A new screen of the app** goes under the `allowed` guard. A screen outside every guard is open
  to anyone: never leave one there.
- A screen for the admin only gets its own guard when the admin screens arrive (`isAdmin` on the
  person's `allowedEmails` entry); until then, nothing in the app is admin-only.

## Testing

Test the guards with expo-router's `renderRouter` and `useAccess` mocked: the routes are plain
components, so the test checks which one each status shows, without Firebase — see
`src/app/_layout.test.tsx`. Test the status itself through `accessStatusFor`, one case per row of
the table above.
