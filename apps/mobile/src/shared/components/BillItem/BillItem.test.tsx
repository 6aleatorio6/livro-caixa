import { render, screen, userEvent } from '@testing-library/react-native';

import { BillItem } from './BillItem';

describe('BillItem', () => {
  it('Should show the day, the tag and the expected amount on the right', async () => {
    await render(<BillItem name="Internet" amountCents={11990} dayOfMonth={15} tagName="Serviços" />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('todo dia 15 · Serviços')).toBeOnTheScreen();
    expect(screen.getByText('R$ 119,90')).toBeOnTheScreen();
  });

  it('Should show only the day when the bill has no tag', async () => {
    await render(<BillItem name="Gás" amountCents={12000} dayOfMonth={25} />);

    expect(screen.getByText('todo dia 25')).toBeOnTheScreen();
  });

  it('Should call onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<BillItem name="Internet" amountCents={11990} dayOfMonth={15} onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: /^Internet/ }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should not be a button without onPress', async () => {
    await render(<BillItem name="Internet" amountCents={11990} dayOfMonth={15} />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
