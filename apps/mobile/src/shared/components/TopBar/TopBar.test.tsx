import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { TopBar } from './TopBar';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

describe('TopBar', () => {
  it('Should go back when Voltar is pressed', async () => {
    await render(<TopBar title="E-mails permitidos" />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Voltar' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
