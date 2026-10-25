import type { ReactNode } from 'react';
import { View } from 'react-native';

interface IScopedThemeModule {
  ScopedTheme: (props: { name: string; children?: ReactNode }) => ReactNode;
}

/**
 * Faz o `ScopedTheme` do Unistyles, que no Jest só repassa os filhos, embrulhá-los numa `View` com
 * `testID="scoped-theme-{nome}"`: o mock usa sempre o tema claro, então a cor não se vê, mas o escopo sim.
 */
export function markScopedThemes() {
  const unistyles = jest.requireMock('react-native-unistyles') as IScopedThemeModule;

  jest
    .spyOn(unistyles, 'ScopedTheme')
    .mockImplementation(({ name, children }) => <View testID={`scoped-theme-${name}`}>{children}</View>);
}
