import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import { useEnsureOwnName } from '@/features/auth/hooks/useEnsureOwnName/useEnsureOwnName';

import TabsLayout from '@/app/(tabs)/_layout';

// O nome da primeira entrada tem o teste do próprio hook; aqui só se confere que o layout o chama. Mock
// com fábrica: o módulo real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/features/auth/hooks/useEnsureOwnName/useEnsureOwnName', () => ({ useEnsureOwnName: jest.fn() }));

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
  it('Should ensure the name of the person who opens the tabs', async () => {
    await renderTabs();

    expect(useEnsureOwnName).toHaveBeenCalled();
  });

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

  it('Should go back to Início when Android back is pressed on another tab', async () => {
    await renderTabs();
    await userEvent.setup().press(screen.getByRole('tab', { name: 'Configurações' }));
    expect(await screen.findByText('Página das configurações')).toBeOnTheScreen();

    // O botão de voltar do Android despacha o `GO_BACK`, o mesmo do `router.back()`.
    await act(async () => router.back());

    expect(await screen.findByText('Página do início')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
  });
});
