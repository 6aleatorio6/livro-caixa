import { render, screen, userEvent } from '@testing-library/react-native';
import { object, string } from 'yup';

import { AppText } from '@/shared/components/AppText/AppText';
import { TextFieldSmart } from '@/shared/components/inputs/TextFieldSmart/TextFieldSmart';
import { useAppForm } from '@/shared/hooks/useAppForm/useAppForm';

import { SmartRequiredMark } from './SmartRequiredMark';

// O tipo é opcional para que o único `*` da tela seja o do grupo.
const billSchema = object({
  kind: string(),
  note: string().when('kind', { is: 'outra', then: (field) => field.required() }),
});

function BillForm() {
  const { control } = useAppForm(billSchema, { kind: 'outra', note: '' });
  return (
    <>
      <TextFieldSmart control={control} name="kind" label="Tipo" />
      <AppText>
        Detalhes
        <SmartRequiredMark control={control} names={['note']} />
      </AppText>
    </>
  );
}

describe('SmartRequiredMark', () => {
  it('Should show the mark while the schema requires the field, and follow the other fields', async () => {
    const user = userEvent.setup();
    await render(<BillForm />);
    expect(screen.getByText('*', { includeHiddenElements: true })).toBeOnTheScreen();

    await user.clear(screen.getByLabelText('Tipo'));
    await user.type(screen.getByLabelText('Tipo'), 'aluguel');

    expect(screen.queryByText('*', { includeHiddenElements: true })).toBeNull();
  });

  it('Should keep the mark away from the screen reader', async () => {
    await render(<BillForm />);

    expect(screen.queryByText('*')).toBeNull();
  });
});
