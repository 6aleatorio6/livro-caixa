import { render, screen, userEvent } from '@testing-library/react-native';
import { object, string } from 'yup';

import { useAppForm } from '@/shared/forms/use-app-form';

import { TextFieldSmart } from './text-field-smart';

const billSchema = object({ name: string().required(), note: string().optional() });

function BillForm() {
  const form = useAppForm(billSchema, { name: '', note: '' });
  return (
    <>
      <TextFieldSmart form={form} name="name" label="Nome" />
      <TextFieldSmart form={form} name="note" label="Observação" />
    </>
  );
}

describe('TextFieldSmart', () => {
  it('Should mark only the fields the schema requires', async () => {
    await render(<BillForm />);

    expect(screen.getByText('Nome *')).toBeOnTheScreen();
    expect(screen.getByText('Observação')).toBeOnTheScreen();
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
