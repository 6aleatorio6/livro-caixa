import { render, screen } from '@testing-library/react-native';

import { EntryItem } from './EntryItem';

describe('EntryItem', () => {
  it('Should show the date, the one-off mark, the tag and the amount', async () => {
    await render(<EntryItem name="Conserto" amountCents={18735} date="2026-10-12" tagName="Casa" />);

    expect(screen.getByText('Conserto')).toBeOnTheScreen();
    expect(screen.getByText('12/10 · avulsa · Casa')).toBeOnTheScreen();
    expect(screen.getByText('R$ 187,35')).toBeOnTheScreen();
  });

  it('Should leave the tag out when the bill has none', async () => {
    await render(<EntryItem name="Conserto" amountCents={18735} date="2026-10-12" />);

    expect(screen.getByText('12/10 · avulsa')).toBeOnTheScreen();
  });

  it('Should be read-only', async () => {
    await render(<EntryItem name="Conserto" amountCents={18735} date="2026-10-12" />);

    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});
