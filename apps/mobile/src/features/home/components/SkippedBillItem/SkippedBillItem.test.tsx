import { render, screen, userEvent } from '@testing-library/react-native';

import { SkippedBillItem } from './SkippedBillItem';

describe('SkippedBillItem', () => {
  it('Should say who skipped the month and that it does not count', async () => {
    await render(<SkippedBillItem name="Internet" skippedByName="Ana" onPress={jest.fn()} />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('pulada por Ana · não conta no mês')).toBeOnTheScreen();
  });

  it('Should call onPress from the whole row', async () => {
    const onPress = jest.fn();
    await render(<SkippedBillItem name="Internet" skippedByName="Ana" onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Internet' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
