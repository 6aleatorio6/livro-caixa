import { render, screen } from '@testing-library/react-native';

import type { IMonthSummary } from '@/features/home/types/MonthSummary';

import { MonthCard } from './MonthCard';

const bill = { id: 'x', name: 'Conta', expectedAmountCents: 0, dayOfMonth: 5, startsOn: '2026-01-01', tagId: null };

const summaryOf = ({ paidCents, totalCents, toPayCents, toPayCount, billCount }: Record<string, number>): IMonthSummary => ({
  toPay: Array.from({ length: toPayCount }, () => ({ bill, dueDate: '2026-10-05' })),
  paid: [],
  paidCents,
  totalCents,
  toPayCents,
  billCount,
});

describe('MonthCard', () => {
  it('Should show what is left to pay in the middle of the month', async () => {
    const summary = summaryOf({ paidCents: 278735, totalCents: 300525, toPayCents: 21790, toPayCount: 2, billCount: 6 });
    await render(<MonthCard month="2026-10" summary={summary} />);

    expect(screen.getByText('Falta pagar')).toBeOnTheScreen();
    expect(screen.getByText('R$ 217,90')).toBeOnTheScreen();
    expect(screen.getByText('2 de 6 contas')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Já pago R$ 2.787,35 de R$ 3.005,25' })).toBeOnTheScreen();
    expect(screen.getByTestId('donut-arc')).toBeOnTheScreen();
  });

  it('Should show the legend with the paid amount and the month total', async () => {
    const summary = summaryOf({ paidCents: 278735, totalCents: 300525, toPayCents: 21790, toPayCount: 2, billCount: 6 });
    await render(<MonthCard month="2026-10" summary={summary} />);

    expect(screen.getByText('Já pago')).toBeOnTheScreen();
    expect(screen.getByText('R$ 2.787,35')).toBeOnTheScreen();
    expect(screen.getByText('Total do mês')).toBeOnTheScreen();
    expect(screen.getByText('R$ 3.005,25')).toBeOnTheScreen();
  });

  it('Should say the month is closed when every bill is paid', async () => {
    const summary = summaryOf({ paidCents: 300525, totalCents: 300525, toPayCents: 0, toPayCount: 0, billCount: 6 });
    await render(<MonthCard month="2026-10" summary={summary} />);

    expect(screen.getByText('Mês fechado')).toBeOnTheScreen();
    expect(screen.getByText('Tudo pago')).toBeOnTheScreen();
    expect(screen.getByText('6 de 6 contas')).toBeOnTheScreen();
    expect(screen.getByTestId('donut-arc').props.strokeDasharray[0]).toBeCloseTo(2 * Math.PI * 94);
  });

  it('Should show only the track when the month has bills and none was paid', async () => {
    const summary = summaryOf({ paidCents: 0, totalCents: 21790, toPayCents: 21790, toPayCount: 2, billCount: 2 });
    await render(<MonthCard month="2026-10" summary={summary} />);

    expect(screen.getByText('Falta pagar')).toBeOnTheScreen();
    expect(screen.getAllByText('R$ 217,90')).not.toHaveLength(0);
    expect(screen.queryByTestId('donut-arc')).toBeNull();
  });

  it('Should show the month name and "Sem contas" when the month has no bills', async () => {
    const summary = summaryOf({ paidCents: 0, totalCents: 0, toPayCents: 0, toPayCount: 0, billCount: 0 });
    await render(<MonthCard month="2026-10" summary={summary} />);

    expect(screen.getByText('Outubro')).toBeOnTheScreen();
    expect(screen.getByText('Sem contas')).toBeOnTheScreen();
    expect(screen.getByText('Nenhuma conta neste mês')).toBeOnTheScreen();
    expect(screen.getAllByText('R$ 0,00')).toHaveLength(2);
    expect(screen.queryByTestId('donut-arc')).toBeNull();
  });
});
