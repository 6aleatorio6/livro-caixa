import { render, screen } from '@testing-library/react-native';

import { MonthTotalCard } from './MonthTotalCard';

describe('MonthTotalCard', () => {
  it('Should show the title, the amount and the share of what the family paid', async () => {
    await render(
      <MonthTotalCard title="Sua parte em outubro" amountCents={198735} entryCount={2} familyAmountCents={278735} />,
    );

    expect(screen.getByText('Sua parte em outubro')).toBeOnTheScreen();
    expect(screen.getByText('R$ 1.987,35')).toBeOnTheScreen();
    expect(screen.getByText('2 lançamentos · 71% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should use the singular for one entry', async () => {
    await render(
      <MonthTotalCard title="Sua parte em outubro" amountCents={10000} entryCount={1} familyAmountCents={40000} />,
    );

    expect(screen.getByText('1 lançamento · 25% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should round the percentage down', async () => {
    await render(
      <MonthTotalCard title="Sua parte em outubro" amountCents={199} entryCount={2} familyAmountCents={200} />,
    );

    expect(screen.getByText('2 lançamentos · 99% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should show 0% when the family paid nothing', async () => {
    await render(<MonthTotalCard title="Sua parte em outubro" amountCents={0} entryCount={0} familyAmountCents={0} />);

    expect(screen.getByText('0 lançamentos · 0% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should give the share of another member', async () => {
    await render(
      <MonthTotalCard
        title="Parte de Bruno em outubro"
        amountCents={80000}
        entryCount={2}
        familyAmountCents={278735}
      />,
    );

    expect(screen.getByText('2 lançamentos · 28% do que a família pagou')).toBeOnTheScreen();
  });

  it('Should show the family total without a share of itself', async () => {
    await render(<MonthTotalCard title="A família registrou em outubro" amountCents={278735} entryCount={4} />);

    expect(screen.getByText('A família registrou em outubro')).toBeOnTheScreen();
    expect(screen.getByText('4 lançamentos')).toBeOnTheScreen();
  });
});
