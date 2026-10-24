import { render, screen } from '@testing-library/react-native';

import { useToastStore } from '@/core/store/toast.store';

import { AppToast } from './AppToast';

describe('AppToast', () => {
  it('Should show the message while the toast is visible', async () => {
    useToastStore.setState({ message: 'Conta salva', kind: 'success', isVisible: true });

    await render(<AppToast />);

    expect(screen.getByRole('alert')).toHaveTextContent('Conta salva');
  });

  it('Should show nothing once the toast is hidden', async () => {
    useToastStore.setState({ message: 'Conta salva', kind: 'success', isVisible: false });

    await render(<AppToast />);

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
