import { render, screen, userEvent } from '@testing-library/react-native';

import { MonthSwitcher } from './MonthSwitcher';

describe('MonthSwitcher', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 9, 25), doNotFake: ['setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'nextTick'] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Should show the label and the month title', async () => {
    await render(<MonthSwitcher label="Meus pagamentos" month="2026-10" onMonthChange={jest.fn()} />);

    expect(screen.getByText('Meus pagamentos')).toBeOnTheScreen();
    expect(screen.getByText('Outubro de 2026')).toBeOnTheScreen();
  });

  it('Should mark the current month', async () => {
    await render(<MonthSwitcher label="Início" month="2026-10" onMonthChange={jest.fn()} />);

    expect(screen.getByText('Este mês')).toBeOnTheScreen();
    expect(screen.queryByText('Mês que vem')).not.toBeOnTheScreen();
  });

  it('Should mark the next month', async () => {
    await render(<MonthSwitcher label="Início" month="2026-11" onMonthChange={jest.fn()} />);

    expect(screen.getByText('Mês que vem')).toBeOnTheScreen();
    expect(screen.queryByText('Este mês')).not.toBeOnTheScreen();
  });

  it('Should not mark an earlier month', async () => {
    await render(<MonthSwitcher label="Início" month="2026-09" onMonthChange={jest.fn()} />);

    expect(screen.queryByText('Este mês')).not.toBeOnTheScreen();
    expect(screen.queryByText('Mês que vem')).not.toBeOnTheScreen();
  });

  it('Should ask for the previous month, even across a year', async () => {
    const onMonthChange = jest.fn();
    await render(<MonthSwitcher label="Meus pagamentos" month="2026-01" onMonthChange={onMonthChange} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(onMonthChange).toHaveBeenCalledWith('2025-12');
  });

  it('Should disable the next month on the month after the current one', async () => {
    const onMonthChange = jest.fn();
    await render(<MonthSwitcher label="Meus pagamentos" month="2026-11" onMonthChange={onMonthChange} />);

    const next = screen.getByRole('button', { name: 'Próximo mês' });
    await userEvent.setup().press(next);

    expect(next).toBeDisabled();
    expect(onMonthChange).not.toHaveBeenCalled();
  });

  it('Should ask for the next month on the current month, so it can be paid before it starts', async () => {
    const onMonthChange = jest.fn();
    await render(<MonthSwitcher label="Meus pagamentos" month="2026-10" onMonthChange={onMonthChange} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-11');
  });

  it('Should ask for the next month on an earlier month', async () => {
    const onMonthChange = jest.fn();
    await render(<MonthSwitcher label="Meus pagamentos" month="2026-09" onMonthChange={onMonthChange} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-10');
  });
});
