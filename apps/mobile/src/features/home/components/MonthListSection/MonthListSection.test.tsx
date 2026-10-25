import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { MonthListSection } from './MonthListSection';

describe('MonthListSection', () => {
  it('Should show the title, the count with the sum and the rows', async () => {
    await render(
      <MonthListSection title="A pagar" count={2} totalCents={21790}>
        <Text>Linha</Text>
      </MonthListSection>,
    );

    expect(screen.getByRole('header', { name: 'A pagar' })).toBeOnTheScreen();
    expect(screen.getByText('2 contas · R$ 217,90')).toBeOnTheScreen();
    expect(screen.getByText('Linha')).toBeOnTheScreen();
  });

  it('Should use the singular for one bill', async () => {
    await render(
      <MonthListSection title="Pagas" count={1} totalCents={18735}>
        <Text>Linha</Text>
      </MonthListSection>,
    );

    expect(screen.getByText('1 conta · R$ 187,35')).toBeOnTheScreen();
  });
});
