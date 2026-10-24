import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AboveNavigationBarContext } from './AboveNavigationBarContext';

const BOTTOM_INSET = 24;

describe('Screen', () => {
  let Screen: typeof import('./Screen').Screen;

  beforeAll(() => {
    // O mock do Unistyles resolve o `rt` com todos os recuos em 0 e não deixa mudá-lo; o teste
    // entrega à folha de estilos da tela um recuo de baixo diferente de 0.
    const createStyleSheet = StyleSheet.create as (styles: unknown) => unknown;
    jest.spyOn(StyleSheet, 'create').mockImplementation(((styles: unknown) =>
      createStyleSheet(
        typeof styles === 'function'
          ? (theme: unknown) =>
              (styles as (theme: unknown, rt: unknown) => unknown)(theme, {
                insets: { top: 0, left: 0, right: 0, bottom: BOTTOM_INSET },
              })
          : styles,
      )) as typeof StyleSheet.create);

    // Importada só agora: a folha de estilos da tela é criada quando o módulo carrega.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Screen = require('./Screen').Screen;
  });

  it('Should pad the bottom with the system inset by default', async () => {
    await render(
      <Screen>
        <Text>Conteúdo</Text>
      </Screen>,
    );

    expect(screen.getByText('Conteúdo').parent).toHaveStyle({ paddingBottom: BOTTOM_INSET });
  });

  it('Should leave no bottom padding inside the tabs, above the navigation bar', async () => {
    await render(
      <AboveNavigationBarContext value>
        <Screen>
          <Text>Conteúdo</Text>
        </Screen>
      </AboveNavigationBarContext>,
    );

    expect(screen.getByText('Conteúdo').parent).toHaveStyle({ paddingBottom: 0 });
  });
});
