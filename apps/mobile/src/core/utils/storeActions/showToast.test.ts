import { showToast } from './showToast';
import { useToastStore } from '@/core/store/toast.store';

beforeEach(() => {
  jest.useFakeTimers();
  useToastStore.setState({ message: '', kind: 'success', isVisible: false });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('showToast', () => {
  it('Should hide the toast after it has been on screen for its duration', () => {
    showToast('Conta salva');

    jest.advanceTimersByTime(3999);
    expect(useToastStore.getState().isVisible).toBe(true);
    jest.advanceTimersByTime(1);
    expect(useToastStore.getState().isVisible).toBe(false);
  });

  it('Should restart the duration when another toast replaces the first', () => {
    showToast('Conta salva');
    jest.advanceTimersByTime(3000);

    showToast('Tag criada');
    jest.advanceTimersByTime(3000);

    expect(useToastStore.getState()).toMatchObject({ message: 'Tag criada', isVisible: true });
  });
});
