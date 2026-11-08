import { render, screen } from '@testing-library/react-native';

import { useAppVersionLockStore } from '@/shared/store/appVersionLock.store';

import { UpdateRequiredPage } from './UpdateRequiredPage';

jest.mock('@/shared/constants/appVersion', () => ({ APP_VERSION: '0.4.0' }));

describe('UpdateRequiredPage', () => {
  it('Should tell the installed version and the required one', async () => {
    useAppVersionLockStore.setState({ requiredVersion: '0.5.0' });

    await render(<UpdateRequiredPage />);

    expect(
      screen.getByText(
        'A versão 0.4.0 do Livro-Caixa, instalada neste celular, não abre mais. Para continuar, instale a versão 0.5.0 ou uma mais nova.',
      ),
    ).toBeOnTheScreen();
  });
});
