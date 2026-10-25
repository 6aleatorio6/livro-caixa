import { render, screen } from '@testing-library/react-native';

import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('Should announce that the list is loading', async () => {
    await render(<LoadingState />);

    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();
  });
});
