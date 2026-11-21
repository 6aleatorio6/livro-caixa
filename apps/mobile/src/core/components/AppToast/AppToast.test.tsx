import { render, screen, userEvent } from '@testing-library/react-native';

import { useToastStore } from '@/core/store/toast.store';
import { showToast } from '@/core/utils/storeActions/showToast';

import { AppToast } from './AppToast';

// O teste do timer liga os timers falsos; o relógio real volta mesmo quando ele falha, para não vazar aos seguintes.
afterEach(() => {
  jest.useRealTimers();
});

describe('AppToast', () => {
  it('Should show the message while the toast is visible', async () => {
    useToastStore.setState({ toast: { message: 'Conta salva', kind: 'success' } });

    await render(<AppToast />);

    expect(screen.getByRole('alert')).toHaveTextContent('Conta salva');
  });

  it('Should show nothing once the toast is hidden', async () => {
    useToastStore.setState({ toast: null });

    await render(<AppToast />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('Should show no action button when the toast has no action', async () => {
    useToastStore.setState({ toast: { message: 'Conta salva', kind: 'success' } });

    await render(<AppToast />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Should call the action and hide the toast when its button is pressed', async () => {
    const onPress = jest.fn();
    useToastStore.setState({
      toast: { message: 'Internet de outubro pulada.', kind: 'success', action: { label: 'Desfazer', onPress } },
    });
    await render(<AppToast />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Desfazer' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('Should leave no hide timer armed after the action closes the toast', async () => {
    jest.useFakeTimers();
    showToast('Internet de outubro pulada.', 'success', { label: 'Desfazer', onPress: jest.fn() });
    await render(<AppToast />);

    await userEvent
      .setup({ advanceTimers: jest.advanceTimersByTime })
      .press(screen.getByRole('button', { name: 'Desfazer' }));

    expect(jest.getTimerCount()).toBe(0);
  });
});
