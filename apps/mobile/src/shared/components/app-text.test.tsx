import { render, screen } from '@testing-library/react-native';

import { lightTheme } from '@/shared/theme/light-theme';

import { AppText } from './app-text';

describe('AppText', () => {
  it('Should take the size, weight and color of the roles it receives', async () => {
    await render(
      <AppText variant="titleMedium" color="primary">
        Contas do mês
      </AppText>,
    );

    expect(screen.getByText('Contas do mês')).toHaveStyle({
      fontSize: lightTheme.typography.titleMedium.fontSize,
      fontWeight: lightTheme.typography.titleMedium.fontWeight,
      color: lightTheme.colors.primary,
    });
  });

  it('Should fall back to the body text in the color for text on surfaces', async () => {
    await render(<AppText>Sem conta a pagar</AppText>);

    expect(screen.getByText('Sem conta a pagar')).toHaveStyle({
      fontSize: lightTheme.typography.bodyLarge.fontSize,
      color: lightTheme.colors.onSurface,
    });
  });
});
