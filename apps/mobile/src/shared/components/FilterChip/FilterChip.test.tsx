import { render, screen, userEvent } from '@testing-library/react-native';

import { FilterChip } from './FilterChip';

describe('FilterChip', () => {
  it('Should announce the chip as selected and call onPress', async () => {
    const onPress = jest.fn();
    await render(<FilterChip label="Bruno" isSelected onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Bruno' });

    await userEvent.setup().press(chip);

    expect(chip).toBeSelected();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should announce the chip as not selected by default', async () => {
    await render(<FilterChip label="Você" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Você' })).not.toBeSelected();
  });

  it('Should be only a label without onPress', async () => {
    await render(<FilterChip label="Saúde" />);

    expect(screen.getByText('Saúde')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
