import { hideToast } from './hideToast';
import { showToast } from './showToast';
import { useToastStore } from '@/core/store/toast.store';

beforeEach(() => {
  jest.useFakeTimers();
  useToastStore.setState({ toast: null });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('hideToast', () => {
  it('Should hide the toast now', () => {
    showToast('Conta salva');

    hideToast();

    expect(useToastStore.getState().toast).toBeNull();
  });

  it('Should leave no hide timer armed once the toast is hidden', () => {
    showToast('Internet de outubro pulada.', 'success', { label: 'Desfazer', onPress: jest.fn() });

    hideToast();

    expect(jest.getTimerCount()).toBe(0);
  });
});
