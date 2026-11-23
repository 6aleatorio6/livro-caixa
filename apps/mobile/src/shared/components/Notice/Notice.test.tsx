import { Info } from 'lucide-react-native';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { lightTheme } from '@/core/theme/lightTheme';

import { Notice } from './Notice';

describe('Notice', () => {
  it('Should show the text', async () => {
    await render(<Notice icon={Info} text="Os meses já pagos não mudam." />);

    expect(screen.getByText('Os meses já pagos não mudam.')).toBeOnTheScreen();
  });

  it('Should use the surface colors by default', async () => {
    await render(<Notice icon={Info} text="Os meses já pagos não mudam." />);

    const text = screen.getByText('Os meses já pagos não mudam.');
    expect(StyleSheet.flatten(text.parent?.props.style).backgroundColor).toBe(lightTheme.colors.surfaceContainer);
    expect(StyleSheet.flatten(text.props.style).color).toBe(lightTheme.colors.onSurfaceVariant);
  });

  it('Should use the error container colors with the error tone', async () => {
    await render(<Notice icon={Info} text="Atrasada desde 15 de outubro." tone="error" />);

    const text = screen.getByText('Atrasada desde 15 de outubro.');
    expect(StyleSheet.flatten(text.parent?.props.style).backgroundColor).toBe(lightTheme.colors.errorContainer);
    expect(StyleSheet.flatten(text.props.style).color).toBe(lightTheme.colors.onErrorContainer);
  });
});
