import { render, screen, userEvent } from '@testing-library/react-native';

import { TagChip } from './TagChip';

describe('TagChip', () => {
  it('Should announce the chip as selected and call onPress', async () => {
    const onPress = jest.fn();
    await render(<TagChip name="Casa" color="wood" isSelected onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Casa' });

    await userEvent.setup().press(chip);

    expect(chip).toBeSelected();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should announce the chip as not selected by default', async () => {
    await render(<TagChip name="Serviços" color="blue" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Serviços' })).not.toBeSelected();
  });

  it('Should be only a label without onPress', async () => {
    await render(<TagChip name="Saúde" color="plum" />);

    expect(screen.getByText('Saúde')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
