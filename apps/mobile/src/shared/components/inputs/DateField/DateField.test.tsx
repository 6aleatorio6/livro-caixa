import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { DateField } from './DateField';

jest.mock('@react-native-community/datetimepicker', () => ({ DateTimePickerAndroid: { open: jest.fn() } }));

type IOpenArgs = Parameters<typeof DateTimePickerAndroid.open>[0];

function openedWith() {
  return jest.mocked(DateTimePickerAndroid.open).mock.calls[0][0] as IOpenArgs & {
    onValueChange: (event: unknown, date: Date) => void;
    onDismiss?: () => void;
  };
}

async function renderDateField(initial = '', maximumDate?: Date) {
  const onBlur = jest.fn();
  function Harness() {
    const [value, setValue] = useState(initial);
    return <DateField label="Vale a partir de" value={value} onValueChange={setValue} onBlur={onBlur} maximumDate={maximumDate} />;
  }
  await render(<Harness />);
  return { onBlur, field: () => screen.getByRole('button', { name: 'Vale a partir de' }) };
}

describe('DateField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should show the date as the person reads it', async () => {
    await renderDateField('2026-11-01');

    expect(screen.getByDisplayValue('01/11/2026')).toBeOnTheScreen();
  });

  it('Should be a button with the label and the value', async () => {
    const { field } = await renderDateField('2026-11-01');

    expect(field()).toHaveAccessibilityValue({ text: '01/11/2026' });
  });

  it('Should open the calendar on the current value', async () => {
    const user = userEvent.setup();
    const { field } = await renderDateField('2026-11-01');

    await user.press(field());

    const args = openedWith();
    expect(args.mode).toBe('date');
    expect(args.value.getFullYear()).toBe(2026);
    expect(args.value.getMonth()).toBe(10);
    expect(args.value.getDate()).toBe(1);
  });

  it('Should open the calendar on today when the field is empty', async () => {
    const user = userEvent.setup();
    const { field } = await renderDateField();

    await user.press(field());

    expect(openedWith().value.toDateString()).toBe(new Date().toDateString());
  });

  it('Should limit the calendar to the maximum date', async () => {
    const user = userEvent.setup();
    const maximumDate = new Date(2026, 9, 25);
    const { field } = await renderDateField('2026-10-12', maximumDate);

    await user.press(field());

    expect(openedWith().maximumDate).toBe(maximumDate);
  });

  it('Should write the chosen date and leave the field', async () => {
    const user = userEvent.setup();
    const { field, onBlur } = await renderDateField('2026-10-12');
    await user.press(field());

    openedWith().onValueChange({}, new Date(2026, 10, 1));

    expect(await screen.findByDisplayValue('01/11/2026')).toBeOnTheScreen();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('Should change nothing when the calendar is dismissed', async () => {
    const user = userEvent.setup();
    const { field, onBlur } = await renderDateField('2026-10-12');
    await user.press(field());

    const { onDismiss } = openedWith();
    onDismiss?.();

    expect(screen.getByDisplayValue('12/10/2026')).toBeOnTheScreen();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it('Should not open the calendar while disabled', async () => {
    const user = userEvent.setup();
    await render(
      <DateField label="Vale a partir de" value="" onValueChange={jest.fn()} onBlur={jest.fn()} disabled />,
    );

    await user.press(screen.getByRole('button', { name: 'Vale a partir de' }));

    expect(DateTimePickerAndroid.open).not.toHaveBeenCalled();
  });
});
