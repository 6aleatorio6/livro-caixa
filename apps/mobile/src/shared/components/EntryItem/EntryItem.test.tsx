import { render, screen, userEvent } from '@testing-library/react-native';

import { EntryItem } from './EntryItem';

describe('EntryItem', () => {
  it('Should show the name, the support and the amount of a one-off bill', async () => {
    await render(<EntryItem kind="oneOff" name="Conserto" amountCents={18735} support="12/10 · avulsa · Casa" />);

    expect(screen.getByText('Conserto')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa · Casa')).toBeOnTheScreen();
    expect(screen.getByText('R$ 187,35')).toBeOnTheScreen();
  });

  it('Should show the name, the support and the amount of a payment', async () => {
    await render(<EntryItem kind="payment" name="Aluguel" amountCents={180000} support="dia 5 · Ana · Casa" />);

    expect(screen.getByText('Aluguel')).toBeOnTheScreen();
    expect(screen.getByText('dia 5 · Ana · Casa')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.800,00')).toBeOnTheScreen();
  });

  it.each(['oneOff', 'payment'] as const)('Should be read-only as a %s', async (kind) => {
    await render(<EntryItem kind={kind} name="Aluguel" amountCents={180000} support="dia 5" />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('Should be a button named after the entry and call onPress when given one', async () => {
    const onPress = jest.fn();
    await render(<EntryItem kind="payment" name="Aluguel" amountCents={180000} support="dia 5" onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Aluguel' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
