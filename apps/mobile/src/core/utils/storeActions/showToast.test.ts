import { showToast } from './showToast';
import { useToastStore } from '@/core/store/toast.store';

beforeEach(() => {
  jest.useFakeTimers();
  useToastStore.setState({ toast: null });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('showToast', () => {
  it('Should hide the toast after it has been on screen for its duration', () => {
    showToast('Conta salva');

    jest.advanceTimersByTime(3999);
    expect(useToastStore.getState().toast).not.toBeNull();
    jest.advanceTimersByTime(1);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('Should restart the duration when another toast replaces the first', () => {
    showToast('Conta salva');
    jest.advanceTimersByTime(3000);

    showToast('Tag criada');
    jest.advanceTimersByTime(3000);

    expect(useToastStore.getState().toast).toEqual({ message: 'Tag criada', kind: 'success' });
  });

  it('Should keep a toast with an action for 6 seconds, longer than one without it', () => {
    showToast('Internet de outubro pulada.', 'success', { label: 'Desfazer', onPress: jest.fn() });

    jest.advanceTimersByTime(5999);
    expect(useToastStore.getState().toast).not.toBeNull();
    jest.advanceTimersByTime(1);
    expect(useToastStore.getState().toast).toBeNull();
  });

  it('Should carry the action in the toast', () => {
    const action = { label: 'Desfazer', onPress: jest.fn() };

    showToast('Internet de outubro pulada.', 'success', action);

    expect(useToastStore.getState().toast).toEqual({
      message: 'Internet de outubro pulada.',
      kind: 'success',
      action,
    });
  });

  it('Should go back to 4 seconds when a toast without an action replaces one with it', () => {
    showToast('Internet de outubro pulada.', 'success', { label: 'Desfazer', onPress: jest.fn() });

    showToast('Conta salva');
    jest.advanceTimersByTime(4000);

    expect(useToastStore.getState().toast).toBeNull();
  });
});
