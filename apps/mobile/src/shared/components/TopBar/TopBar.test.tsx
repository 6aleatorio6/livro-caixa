import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import { TopBar } from './TopBar';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TopBar', () => {
  it('Should go back when Voltar is pressed', async () => {
    await render(<TopBar title="E-mails permitidos" />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Voltar' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('Should offer Fechar instead of Voltar for the close icon, and go back with it', async () => {
    await render(<TopBar title="recibo.jpg" icon="close" />);

    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Fechar' }));

    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('Should run onBack instead of going back when it is given', async () => {
    const onBack = jest.fn();
    await render(<TopBar title="Qual conta você pagou?" icon="close" onBack={onBack} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Fechar' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(router.back).not.toHaveBeenCalled();
  });
});
