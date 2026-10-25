import { render, screen, userEvent } from '@testing-library/react-native';

import { BillToPayItem } from './BillToPayItem';

describe('BillToPayItem', () => {
  it('Should show the expected amount, the due day and the tag', async () => {
    await render(<BillToPayItem name="Internet" expectedCents={11990} dueDay={15} tagName="Serviços" onPress={jest.fn()} />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('R$ 119,90 · vence dia 15 · Serviços')).toBeOnTheScreen();
  });

  it('Should leave the tag out when the bill has none', async () => {
    await render(<BillToPayItem name="Gás" expectedCents={12000} dueDay={25} onPress={jest.fn()} />);

    expect(screen.getByText('R$ 120,00 · vence dia 25')).toBeOnTheScreen();
  });

  it('Should call onPress from the "Registrar" button', async () => {
    const onPress = jest.fn();
    await render(<BillToPayItem name="Internet" expectedCents={11990} dueDay={15} onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Registrar Internet' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should call onPress from the whole row', async () => {
    const onPress = jest.fn();
    await render(<BillToPayItem name="Internet" expectedCents={11990} dueDay={15} onPress={onPress} />);

    await userEvent.setup().press(screen.getByText('Internet'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
