---
name: component-guidelines
description: >-
  How to write a UI component of apps/mobile: styling with Unistyles 3 and the theme's Material 3
  roles (colors, typography, spacing, radii), AppText and Screen as the base of every screen, the
  .pen component frame as the specification with all its states, accessibility (role, label,
  state), Lucide icons, and the React 19 / React Compiler rules. Use whenever creating or changing
  a component or screen in apps/mobile, or styling anything there. Triggers: "cria o componente",
  "estiliza", "cor do tema", "tema escuro", "StyleSheet", "Unistyles", "botão", "campo", "ícone".
---

# Component guidelines for apps/mobile

Where the file goes: skill `project-structure`. How to test it: skill `testing`.

## Styling: Unistyles and the theme

- Import `StyleSheet` from `react-native-unistyles`, never from `react-native`: the Babel plugin
  rewrites these style sheets so the light/dark switch happens without a re-render.
- Every value comes from the theme (`src/core/theme`): `theme.colors.<role>` (the Material 3
  color roles), `theme.typography.<role>`, `theme.spacing.<size>`, `theme.radii.<size>`. A literal
  `#hex`, `rgb()` or `hsl()` fails the lint.
- A style that depends on a prop is a function inside the sheet:

  ```tsx
  const styles = StyleSheet.create((theme) => ({
    container: (isSelected: boolean) => ({
      backgroundColor: theme.colors[isSelected ? 'secondaryContainer' : 'surface'],
      borderRadius: theme.radii.medium,
      padding: theme.spacing.large,
    }),
  }));
  ```

- Safe areas come from the runtime (`rt.insets`), as in `Screen`.
- The theme follows the phone (`adaptiveThemes`). Its values are provisional until the design's
  variables exist (steps 2 to 5 of `design-from-scratch`); when they change, only
  `src/core/theme` changes.

## The base pieces

- **Text:** always `AppText` (`src/shared/components/AppText/AppText.tsx`) with a `variant` (typography
  role) and a `color` (color role). No `Text` from React Native in screens. The exception is
  `core`, which can't import `shared`: its components style text from `theme.typography` directly.
- **Screen root:** `Screen` (`src/shared/components/Screen/Screen.tsx`): the theme background and the
  system bars' insets.
- **Icons:** only `lucide-react-native` (`docs/05-arquitetura/01-plataforma-e-stack.md`). The app
  icon and the illustrations are drawn for the brand, not taken from a package.

## The design is the specification

The component frame of `design/livro-caixa.pen` (`08 Componentes`) is the specification: the same
variants, sizes and **every state it draws** — default, pressed, focused, disabled, error, loading.
Read it through the `pencil` MCP (skill `design`), not from memory. A state the frame doesn't draw
follows the nearest pattern of the frame, and the commit says which.

## Accessibility

Each control states its **role, label and state**, because the code is responsible for it:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel={label}
  accessibilityState={{ disabled, busy: isLoading }}
  …
/>
```

A control with an icon and no text still has a label.

## React rules

- The React Compiler is on (`experiments.reactCompiler` in `app.json`): no `useMemo`,
  `useCallback` or `memo` unless a measured case asks for it, and then with a comment saying why.
- React 19 passes `ref` as a regular prop: no `forwardRef`.
- One component per folder, named after it in PascalCase, with its test beside it
  (`components/Button/Button.tsx`, `Button.test.tsx`) and its `I<Name>Props` interface in the same
  file (`.claude/rules/one-export-per-file.md`). A sub-component used only by this one still gets
  its own folder, in the page's or the feature's `components/`.
- Named exports only.

## In tests

The Unistyles Jest mock (`react-native-unistyles/mocks`, loaded in the Jest setup) resolves every
style sheet with the **first** registered theme, the light one: a test can assert the light values
(`lightTheme.colors.primary`), not the dark ones.
