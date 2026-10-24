import { render, screen, userEvent } from '@testing-library/react-native';
import { object, string } from 'yup';

import { useAppForm } from '@/shared/hooks/useAppForm/useAppForm';

import { TextFieldSmart } from './TextFieldSmart';

const billSchema = object({
  name: string().required(),
  kind: string().required(),
  note: string().when('kind', { is: 'outra', then: (field) => field.required() }),
});

function BillForm({ kind = '' }: { kind?: string }) {
  const { control } = useAppForm(billSchema, { name: '', kind, note: '' });
  return (
    <>
      <TextFieldSmart control={control} name="name" label="Nome" />
      <TextFieldSmart control={control} name="note" label="Observação" />
    </>
  );
}

describe('TextFieldSmart', () => {
  it('Should announce as required only the fields the schema requires', async () => {
    await render(<BillForm />);

    expect(screen.getByLabelText('Nome')).toHaveProp('accessibilityHint', 'Campo obrigatório');
    expect(screen.getByLabelText('Observação')).not.toHaveProp('accessibilityHint');
  });

  it('Should mark a field the schema requires only because of another field', async () => {
    await render(<BillForm kind="outra" />);

    expect(screen.getByLabelText('Observação')).toHaveProp('accessibilityHint', 'Campo obrigatório');
  });

  it('Should show the schema message after leaving a required field empty', async () => {
    const user = userEvent.setup();
    await render(<BillForm />);

    await user.type(screen.getByLabelText('Nome'), 'Lu');
    await user.clear(screen.getByLabelText('Nome'));

    expect(await screen.findByText('Preencha este campo.')).toBeOnTheScreen();
  });

  it('Should not show the message while the field was never left', async () => {
    const user = userEvent.setup();
    await render(<BillForm />);

    await user.type(screen.getByLabelText('Nome'), 'Lu', { skipBlur: true });

    expect(screen.queryByText('Preencha este campo.')).toBeNull();
  });
});
