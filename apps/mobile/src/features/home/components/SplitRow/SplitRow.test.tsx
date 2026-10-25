import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { SplitRow } from './SplitRow';

const barWidth = () => StyleSheet.flatten(screen.getByTestId('split-bar-fill', { includeHiddenElements: true }).props.style).width;

describe('SplitRow', () => {
  it('Should show the name, the paid amount and a bar proportional to the paid month', async () => {
    await render(<SplitRow mark="dot" name="Casa" paidCents={300000} monthPaidCents={400000} color="primary" />);

    expect(screen.getByText('Casa')).toBeOnTheScreen();
    expect(screen.getByText('R$ 3.000,00')).toBeOnTheScreen();
    expect(barWidth()).toBe('75%');
  });

  it('Should draw an empty bar when nothing was paid in the month', async () => {
    await render(<SplitRow mark="dot" name="Casa" paidCents={0} monthPaidCents={0} color="primary" />);

    expect(barWidth()).toBe('0%');
  });

  it('Should show the detail only when there is one', async () => {
    const { rerender } = await render(
      <SplitRow mark="dot" name="Serviços" paidCents={100000} monthPaidCents={400000} color="primary" detail="e mais R$ 217,90 a pagar" />,
    );
    expect(screen.getByText('e mais R$ 217,90 a pagar')).toBeOnTheScreen();

    await rerender(<SplitRow mark="dot" name="Serviços" paidCents={100000} monthPaidCents={400000} color="primary" />);
    expect(screen.queryByText(/a pagar$/)).not.toBeOnTheScreen();
  });

  it('Should show the initial of the name when the mark is an avatar', async () => {
    await render(<SplitRow mark="avatar" name="Ana" paidCents={139367} monthPaidCents={278735} color="primary" />);

    expect(screen.getByText('A', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByText('Ana')).toBeOnTheScreen();
  });
});
