import { Info } from 'lucide-react-native';
import { render, screen } from '@testing-library/react-native';

import { Notice } from './Notice';

describe('Notice', () => {
  it('Should show the text', async () => {
    await render(<Notice icon={Info} text="Os meses já pagos não mudam." />);

    expect(screen.getByText('Os meses já pagos não mudam.')).toBeOnTheScreen();
  });
});
