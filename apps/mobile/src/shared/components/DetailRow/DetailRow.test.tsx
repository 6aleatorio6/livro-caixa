import { render, screen } from '@testing-library/react-native';

import { lightTheme } from '@/core/theme/lightTheme';

import { DetailRow } from './DetailRow';

describe('DetailRow', () => {
  it('Should show the label and the value', async () => {
    await render(<DetailRow label="Pago por" value="Ana" />);

    expect(screen.getByText('Pago por')).toBeOnTheScreen();
    expect(screen.getByText('Ana')).toBeOnTheScreen();
  });

  it('Should show the dot of the tag color only when given one', async () => {
    const { toJSON } = await render(<DetailRow label="Tag" value="Serviços" tagColor="blue" />);

    expect(JSON.stringify(toJSON())).toContain(lightTheme.colors.tagBlue);
  });
});
