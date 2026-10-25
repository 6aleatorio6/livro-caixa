import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { spacing } from '@/core/theme/spacing';

const BOTTOM_INSET = 24;

type IHostElement = ReturnType<typeof screen.getByText>;

// O painel é o ancestral do conteúdo que arredonda os cantos de cima.
function panelOf(element: IHostElement) {
  let node: IHostElement | null = element;
  while (node && !StyleSheet.flatten(node.props.style)?.borderTopLeftRadius) node = node.parent;
  return node;
}

describe('BottomSheet', () => {
  let BottomSheet: typeof import('./BottomSheet').BottomSheet;

  beforeAll(() => {
    // O mock do Unistyles resolve o `rt` com todos os recuos em 0 e não deixa mudá-lo; o teste
    // entrega à folha de estilos um recuo de baixo diferente de 0, o da barra de navegação.
    const createStyleSheet = StyleSheet.create as (styles: unknown) => unknown;
    jest.spyOn(StyleSheet, 'create').mockImplementation(((styles: unknown) =>
      createStyleSheet(
        typeof styles === 'function'
          ? (theme: unknown) =>
              (styles as (theme: unknown, rt: unknown) => unknown)(theme, {
                insets: { top: 0, left: 0, right: 0, bottom: BOTTOM_INSET },
                screen: { width: 411, height: 914 },
              })
          : styles,
      )) as typeof StyleSheet.create);

    // Importada só agora: a folha de estilos é criada quando o módulo carrega.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    BottomSheet = require('./BottomSheet').BottomSheet;
  });

  it('Should show its content and close through the scrim', async () => {
    const onClose = jest.fn();
    await render(
      <BottomSheet onClose={onClose}>
        <Text>Luz</Text>
      </BottomSheet>,
    );
    const user = userEvent.setup();

    expect(screen.getByText('Luz')).toBeOnTheScreen();
    expect(onClose).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Should keep its last actions above the navigation bar', async () => {
    await render(
      <BottomSheet onClose={jest.fn()}>
        <Text>Luz</Text>
      </BottomSheet>,
    );

    expect(panelOf(screen.getByText('Luz'))).toHaveStyle({
      paddingBottom: spacing.extraLargeIncreased + BOTTOM_INSET,
    });
  });
});
