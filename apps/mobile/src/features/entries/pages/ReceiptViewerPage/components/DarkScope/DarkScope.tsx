import type { ReactNode } from 'react';
import { ScopedTheme } from 'react-native-unistyles';

export interface IDarkScopeProps {
  children: ReactNode;
}

/**
 * Pinta o que está dentro com o tema escuro, mesmo com o celular no claro: o visualizador do comprovante é
 * escuro sempre. O mock do Unistyles no Jest devolve `null` no lugar do `ScopedTheme`, então o teste da tela
 * troca este componente por um que só repassa os filhos.
 */
export function DarkScope({ children }: IDarkScopeProps) {
  return <ScopedTheme name="dark">{children}</ScopedTheme>;
}
