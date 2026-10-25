import type { ReactNode } from 'react';

// O mock do Unistyles (`react-native-unistyles/mocks`) devolve `null` no lugar do `ScopedTheme`, e a tela dentro dele
// sumiria dos testes. Aqui ele repassa os filhos: o tema do mock é sempre o primeiro, o claro.
const unistyles = jest.requireMock('react-native-unistyles') as { ScopedTheme: unknown };
unistyles.ScopedTheme = ({ children }: { children?: ReactNode }) => children;
