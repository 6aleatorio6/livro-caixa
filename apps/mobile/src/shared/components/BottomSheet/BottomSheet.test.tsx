import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('Should show its content and close through the scrim', async () => {
    const onClose = jest.fn();
    await render(
      <BottomSheet onClose={onClose}>
        <Text>Luz</Text>
      </BottomSheet>,
    );
    const user = userEvent.setup();

    expect(screen.getByText('Luz')).toBeOnTheScreen();
    expect(onClose).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
