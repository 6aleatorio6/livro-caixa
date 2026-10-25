import { render, screen } from '@testing-library/react-native';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('Should show the title and the text', async () => {
    await render(
      <EmptyState
        image={{ uri: 'month-closed' }}
        title="Nenhum pagamento seu em outubro"
        text="Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui."
      />,
    );

    expect(screen.getByText('Nenhum pagamento seu em outubro')).toBeOnTheScreen();
    expect(
      screen.getByText('Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.'),
    ).toBeOnTheScreen();
  });
});
