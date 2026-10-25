import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { DonutChart } from './DonutChart';

const CIRCUMFERENCE = 2 * Math.PI * 94;

async function renderDonut(paidCents: number, totalCents: number) {
  await render(
    <DonutChart paidCents={paidCents} totalCents={totalCents} accessibilityLabel="Já pago R$ 5,00 de R$ 10,00">
      <Text>Centro</Text>
    </DonutChart>,
  );
}

describe('DonutChart', () => {
  it('Should draw an arc proportional to what was paid', async () => {
    await renderDonut(2500, 10000);

    const [arcLength, gap] = screen.getByTestId('donut-arc').props.strokeDasharray;
    expect(arcLength).toBeCloseTo(CIRCUMFERENCE / 4);
    expect(gap).toBeCloseTo(CIRCUMFERENCE);
  });

  it('Should draw no arc when nothing was paid', async () => {
    await renderDonut(0, 10000);

    expect(screen.getByTestId('donut-track')).toBeOnTheScreen();
    expect(screen.queryByTestId('donut-arc')).toBeNull();
  });

  it('Should draw no arc when the month has no total', async () => {
    await renderDonut(0, 0);

    expect(screen.queryByTestId('donut-arc')).toBeNull();
  });

  it('Should close the ring when the paid amount reaches the total', async () => {
    await renderDonut(10000, 10000);

    expect(screen.getByTestId('donut-arc').props.strokeDasharray[0]).toBeCloseTo(CIRCUMFERENCE);
  });

  it('Should never go past the full ring when the paid amount is above the total', async () => {
    await renderDonut(12000, 10000);

    expect(screen.getByTestId('donut-arc').props.strokeDasharray[0]).toBeCloseTo(CIRCUMFERENCE);
  });

  it('Should have round caps and start at 12 o\'clock', async () => {
    await renderDonut(5000, 10000);

    const arc = screen.getByTestId('donut-arc');
    // O react-native-svg converte 'round' no código nativo 1 (butt é 0, square é 2).
    expect(arc.props.strokeLinecap).toBe(1);
    // A rotação de -90° em torno do centro chega ao nativo como a matriz [0, -1, 1, 0, 0, 200].
    const [a, b, c, d, tx, ty] = arc.props.matrix;
    expect([a, b, c, d, tx, ty].map((value: number) => Math.round(value))).toEqual([0, -1, 1, 0, 0, 200]);
  });

  it('Should be announced as an image with the label and show the center', async () => {
    await renderDonut(5000, 10000);

    expect(screen.getByRole('image', { name: 'Já pago R$ 5,00 de R$ 10,00' })).toBeOnTheScreen();
    expect(screen.getByText('Centro')).toBeOnTheScreen();
  });
});
