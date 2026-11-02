import { render, screen, userEvent } from '@testing-library/react-native';

import type { ITag } from '@/shared/types/tag/Tag';

import { BillToPayItem } from './BillToPayItem';

const services: ITag = { id: 'servicos', name: 'Serviços', nameKey: 'servicos', color: 'blue' };

describe('BillToPayItem', () => {
  // A tag aparece só como a bolinha da cor dela; o nome dela fica para o leitor de tela.
  it('Should show the expected amount and the due day, with the tag name only for the screen reader', async () => {
    await render(<BillToPayItem name="Internet" expectedCents={11990} dueDay={15} tag={services} onPress={jest.fn()} />);

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('R$ 119,90 · vence dia 15')).toBeOnTheScreen();
    expect(screen.queryByText(/Serviços/)).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Internet, Serviços' })).toBeOnTheScreen();
  });

  it('Should name only the bill when it has no tag', async () => {
    await render(<BillToPayItem name="Gás" expectedCents={12000} dueDay={25} onPress={jest.fn()} />);

    expect(screen.getByText('R$ 120,00 · vence dia 25')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Gás' })).toBeOnTheScreen();
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
