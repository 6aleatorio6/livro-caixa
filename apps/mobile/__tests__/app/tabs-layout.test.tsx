import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import TabsLayout from '@/app/(tabs)/_layout';

async function renderTabs() {
  await renderRouter(
    {
      _layout: TabsLayout,
      index: () => <Text>Página do início</Text>,
      'my-payments': () => <Text>Página dos pagamentos</Text>,
      settings: () => <Text>Página das configurações</Text>,
    },
    { initialUrl: '/' },
  );
}

describe('TabsLayout', () => {
  it('Should open on Início and keep it when its tab is pressed again', async () => {
    await renderTabs();
    await userEvent.setup().press(screen.getByRole('tab', { name: 'Início' }));

    expect(screen.getByText('Página do início')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Configurações' })).not.toBeSelected();
  });

  it.each([
    ['Configurações', 'Página das configurações'],
    ['Meus pagamentos', 'Página dos pagamentos'],
  ])('Should show %s and mark its tab as selected when pressed', async (tabName, pageText) => {
    await renderTabs();

    await userEvent.setup().press(screen.getByRole('tab', { name: tabName }));

    expect(await screen.findByText(pageText)).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: tabName })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Início' })).not.toBeSelected();
  });
});
