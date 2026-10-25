import { render, screen } from '@testing-library/react-native';

import { useSignedInPersonName } from '@/shared/hooks/useSignedInPersonName/useSignedInPersonName';

import { OwnershipNotice } from './OwnershipNotice';

// Mock com fábrica: o hook real carregaria o React Native Firebase, que não roda no Jest.
jest.mock('@/shared/hooks/useSignedInPersonName/useSignedInPersonName', () => ({ useSignedInPersonName: jest.fn() }));

describe('OwnershipNotice', () => {
  it('Should cite the first name and the subject', async () => {
    jest.mocked(useSignedInPersonName).mockReturnValue('Ana');
    await render(<OwnershipNotice subject="este pagamento" />);

    expect(screen.getByText('Fica no seu nome, Ana. Só você poderá alterar ou excluir este pagamento.')).toBeOnTheScreen();
  });

  it('Should leave the name out while it is unknown', async () => {
    jest.mocked(useSignedInPersonName).mockReturnValue(null);
    await render(<OwnershipNotice subject="esta conta" />);

    expect(screen.getByText('Fica no seu nome. Só você poderá alterar ou excluir esta conta.')).toBeOnTheScreen();
  });
});
