import { act, fireEvent, render, screen, within } from '@testing-library/react-native';

import { markScopedThemes } from '@/shared/testing/markScopedThemes';

import { ZoomableImage } from './ZoomableImage';

// Os gestos e a Reanimated são nativos e se conferem no aparelho; aqui entram só o que a peça precisa para montar.
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { Image: jest.requireActual('react-native').Image },
  useAnimatedStyle: () => ({}),
  useDerivedValue: () => ({ value: false }),
  useSharedValue: (value: unknown) => ({ value }),
  withTiming: (value: unknown) => value,
}));
jest.mock('react-native-worklets', () => ({
  scheduleOnRN: (callback: (...args: unknown[]) => void, ...args: unknown[]) => callback(...args),
}));
jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: unknown }) => children,
  usePanGesture: () => ({}),
  usePinchGesture: () => ({}),
  useTapGesture: () => ({}),
  useSimultaneousGestures: () => ({}),
}));

const HINT = 'Abra os dedos ou toque duas vezes para aproximar.';

beforeEach(() => {
  markScopedThemes();
});

describe('ZoomableImage', () => {
  // A dica aparece depois do `onLoad`, com a peça já montada. O Unistyles aplica o escopo de tema de um `ScopedTheme`
  // só a quem monta junto com ele: sem o seu próprio `ScopedTheme`, a dica saía com a cor do tema claro dentro do
  // visualizador escuro. O Jest não vê a cor (o mock usa o tema claro sempre), então o teste confere o escopo.
  it('Should draw the hint inside its own dark scope, since it mounts after the image loads', async () => {
    await render(<ZoomableImage uri="https://example.com/a.png" onError={jest.fn()} />);
    expect(screen.queryByText(HINT)).not.toBeOnTheScreen();

    await act(async () => fireEvent(screen.getByLabelText('Comprovante'), 'load'));

    expect(within(screen.getByTestId('scoped-theme-dark')).getByText(HINT)).toBeOnTheScreen();
  });
});
