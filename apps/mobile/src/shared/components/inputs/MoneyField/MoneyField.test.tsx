import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { MoneyField } from './MoneyField';

function MoneyFieldHarness({ initial = null, onChange }: { initial?: number | null; onChange?: (value: number | null) => void }) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <MoneyField
      label="Valor previsto"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onBlur={jest.fn()}
    />
  );
}

describe('MoneyField', () => {
  it('Should enter each digit from the right', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await render(<MoneyFieldHarness onChange={onChange} />);

    await user.type(screen.getByLabelText('Valor previsto'), '1');
    expect(screen.getByDisplayValue('R$ 0,01')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Valor previsto'), '2');
    expect(screen.getByDisplayValue('R$ 0,12')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Valor previsto'), '000');
    expect(screen.getByDisplayValue('R$ 120,00')).toBeOnTheScreen();
    expect(onChange).toHaveBeenLastCalledWith(12000);
  });

  it('Should show the value in cents formatted', async () => {
    await render(<MoneyFieldHarness initial={267790} />);

    expect(screen.getByDisplayValue('R$ 2.677,90')).toBeOnTheScreen();
  });

  it('Should show an empty field for null', async () => {
    await render(<MoneyFieldHarness />);

    expect(screen.getByLabelText('Valor previsto')).toHaveDisplayValue('');
  });

  it('Should empty the field when everything is deleted', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await render(<MoneyFieldHarness initial={12000} onChange={onChange} />);

    await user.clear(screen.getByLabelText('Valor previsto'));

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('Should go back to empty when the last digit is deleted', async () => {
    const onChange = jest.fn();
    await render(<MoneyFieldHarness initial={1} onChange={onChange} />);

    // O que o teclado entrega ao apagar um caractere de "R$ 0,01".
    await fireEvent.changeText(screen.getByLabelText('Valor previsto'), 'R$ 0,0');

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByLabelText('Valor previsto')).toHaveDisplayValue('');
  });

  it('Should drop the last digit and keep the rest', async () => {
    await render(<MoneyFieldHarness initial={12345} />);

    await fireEvent.changeText(screen.getByLabelText('Valor previsto'), 'R$ 123,4');

    expect(screen.getByDisplayValue('R$ 12,34')).toBeOnTheScreen();
  });

  it('Should take the value from the digits of the new text when everything is selected and replaced', async () => {
    const onChange = jest.fn();
    await render(<MoneyFieldHarness initial={12345} onChange={onChange} />);

    // Selecionar tudo e digitar "5": o texto novo é só "5", menor que o antigo, mas não é um apagar.
    await fireEvent.changeText(screen.getByLabelText('Valor previsto'), '5');

    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(screen.getByDisplayValue('R$ 0,05')).toBeOnTheScreen();
  });

  it.each([
    { initial: 8500, nextText: 'R$ 85,001', expected: 85001 },
    { initial: 8500, nextText: 'R$ 85,0', expected: 850 },
  ])('Should read $expected cents from "$nextText"', async ({ initial, nextText, expected }) => {
    const onChange = jest.fn();
    await render(<MoneyFieldHarness initial={initial} onChange={onChange} />);

    await fireEvent.changeText(screen.getByLabelText('Valor previsto'), nextText);

    expect(onChange).toHaveBeenLastCalledWith(expected);
  });

  it('Should ignore a digit that passes the limit', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await render(<MoneyFieldHarness initial={999_999_999} onChange={onChange} />);

    await user.type(screen.getByLabelText('Valor previsto'), '1');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('R$ 9.999.999,99')).toBeOnTheScreen();
  });

  it('Should ask for the number keyboard', async () => {
    await render(<MoneyFieldHarness />);

    expect(screen.getByLabelText('Valor previsto')).toHaveProp('keyboardType', 'number-pad');
  });
});
