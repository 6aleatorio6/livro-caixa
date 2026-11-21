import { render, screen, userEvent } from '@testing-library/react-native';

import type { ITag } from '@/shared/types/tag/Tag';

import { BillToPayItem } from './BillToPayItem';

const services: ITag = { id: 'servicos', name: 'Serviços', nameKey: 'servicos', color: 'blue' };

describe('BillToPayItem', () => {
  // A tag aparece só como a bolinha da cor dela; o nome dela fica para o leitor de tela.
  it('Should show the expected amount and the due day, with the tag name only for the screen reader', async () => {
    await render(
      <BillToPayItem
        name="Internet"
        remainingCents={11990}
        dueDay={15}
        billMonth="2026-10"
        tag={services}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('Internet')).toBeOnTheScreen();
    expect(screen.getByText('R$ 119,90 · vence dia 15')).toBeOnTheScreen();
    expect(screen.queryByText(/Serviços/)).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Internet, Serviços' })).toBeOnTheScreen();
  });

  it('Should name only the bill when it has no tag', async () => {
    await render(
      <BillToPayItem name="Gás" remainingCents={12000} dueDay={25} billMonth="2026-10" onPress={jest.fn()} />,
    );

    expect(screen.getByText('R$ 120,00 · vence dia 25')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Gás' })).toBeOnTheScreen();
  });

  it('Should say what is left and where the contributions came from', async () => {
    await render(
      <BillToPayItem
        name="Água"
        remainingCents={5800}
        dueDay={20}
        billMonth="2026-10"
        contributionsSupport="R$ 40,00 de Bruno"
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('faltam R$ 58,00 · R$ 40,00 de Bruno · dia 20')).toBeOnTheScreen();
  });

  it('Should call onPress from the "Pagar" button', async () => {
    const onPress = jest.fn();
    await render(
      <BillToPayItem name="Internet" remainingCents={11990} dueDay={15} billMonth="2026-10" onPress={onPress} />,
    );

    expect(screen.getByText('Pagar')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Pagar Internet' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should call onPress from the whole row', async () => {
    const onPress = jest.fn();
    await render(
      <BillToPayItem name="Internet" remainingCents={11990} dueDay={15} billMonth="2026-10" onPress={onPress} />,
    );

    await userEvent.setup().press(screen.getByText('Internet'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  describe('When the bill is overdue', () => {
    // No mês atual, a atrasada e a conta do mês têm o mesmo nome: o leitor de tela diferencia os dois "Pagar" pelo mês.
    it('Should name the month of a bill from an earlier month on its pay button', async () => {
      await render(
        <BillToPayItem
          name="Água"
          remainingCents={9800}
          dueDay={20}
          billMonth="2026-10"
          overdue="fromEarlierMonth"
          onPress={jest.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: 'Pagar Água de outubro' })).toBeOnTheScreen();
    });

    it('Should keep the plain pay button of an overdue bill seen in its own month', async () => {
      await render(
        <BillToPayItem
          name="Internet"
          remainingCents={11990}
          dueDay={15}
          billMonth="2026-10"
          overdue="inItsMonth"
          onPress={jest.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: 'Pagar Internet' })).toBeOnTheScreen();
    });

    it('Should show the badge and say the bill was due, not that it is due', async () => {
      await render(
        <BillToPayItem
          name="Água"
          remainingCents={9800}
          dueDay={20}
          billMonth="2026-10"
          overdue="fromEarlierMonth"
          onPress={jest.fn()}
        />,
      );

      expect(screen.getByText('De outubro')).toBeOnTheScreen();
      expect(screen.getByText('R$ 98,00 · venceu dia 20')).toBeOnTheScreen();
      expect(screen.queryByText(/vence dia/)).not.toBeOnTheScreen();
    });

    it('Should read the badge after the name in the button label', async () => {
      await render(
        <BillToPayItem
          name="Água"
          remainingCents={9800}
          dueDay={20}
          billMonth="2026-10"
          overdue="inItsMonth"
          onPress={jest.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: 'Água, Atrasada' })).toBeOnTheScreen();
    });

    it('Should keep what is left and the contributions in the support text', async () => {
      await render(
        <BillToPayItem
          name="Água"
          remainingCents={5800}
          dueDay={20}
          billMonth="2026-10"
          contributionsSupport="R$ 40,00 de Bruno"
          overdue="fromEarlierMonth"
          onPress={jest.fn()}
        />,
      );

      expect(screen.getByText('faltam R$ 58,00 · R$ 40,00 de Bruno · dia 20')).toBeOnTheScreen();
    });
  });

  it('Should show no badge when the bill is not overdue', async () => {
    await render(
      <BillToPayItem name="Água" remainingCents={9800} dueDay={20} billMonth="2026-10" onPress={jest.fn()} />,
    );

    expect(screen.queryByText('Atrasada')).not.toBeOnTheScreen();
    expect(screen.queryByText(/^De /)).not.toBeOnTheScreen();
  });
});
