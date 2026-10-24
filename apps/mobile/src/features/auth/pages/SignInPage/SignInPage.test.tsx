import { render, screen, userEvent } from '@testing-library/react-native';

import { signInWithGoogleService } from '@/shared/services/auth/signInWithGoogleService';
import { useToastStore } from '@/core/store/toast.store';

import { SignInPage } from './SignInPage';

jest.mock('@/shared/services/auth/signInWithGoogleService', () => ({ signInWithGoogleService: jest.fn() }));

const signInWithGoogle = signInWithGoogleService as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useToastStore.setState({ toast: null });
});

describe('SignInPage', () => {
  it('Should not start a second sign-in while the first is in progress', async () => {
    let finishSignIn!: () => void;
    signInWithGoogle.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSignIn = () => resolve(null);
        }),
    );
    const user = userEvent.setup();
    await render(<SignInPage />);
    const button = screen.getByRole('button', { name: 'Entrar com Google' });

    await user.press(button);
    await user.press(button);
    finishSignIn();

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('Should show no error when the person closes the Google account picker', async () => {
    signInWithGoogle.mockResolvedValue(null);
    const user = userEvent.setup();
    await render(<SignInPage />);

    await user.press(screen.getByRole('button', { name: 'Entrar com Google' }));

    expect(useToastStore.getState().toast).toBeNull();
    expect(screen.getByRole('button', { name: 'Entrar com Google' })).not.toBeBusy();
  });
});
