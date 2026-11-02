import { render, screen, userEvent } from '@testing-library/react-native';

import { SwitchField } from './SwitchField';

async function renderSwitch({
  isOn = false,
  ...overrides
}: { isOn?: boolean; disabled?: boolean; isLockedOn?: boolean } = {}) {
  const onValueChange = jest.fn();
  await render(
    <SwitchField
      label="Paguei só uma parte"
      supportText="Vira uma contribuição."
      value={isOn}
      onValueChange={onValueChange}
      onBlur={jest.fn()}
      {...overrides}
    />,
  );
  return { onValueChange };
}

describe('SwitchField', () => {
  it('Should turn on from the whole row', async () => {
    const { onValueChange } = await renderSwitch();

    await userEvent.setup().press(screen.getByText('Paguei só uma parte'));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('Should turn off when it is on', async () => {
    const { onValueChange } = await renderSwitch({ isOn: true });

    await userEvent.setup().press(screen.getByRole('switch', { name: 'Paguei só uma parte' }));

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('Should not change while disabled, and say it is on and disabled', async () => {
    const { onValueChange } = await renderSwitch({ isOn: true, disabled: true });

    await userEvent.setup().press(screen.getByRole('switch', { name: 'Paguei só uma parte' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Paguei só uma parte' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Paguei só uma parte' })).toBeDisabled();
  });

  it('Should show on and disabled when locked on, whatever its value', async () => {
    const { onValueChange } = await renderSwitch({ isOn: false, isLockedOn: true });

    await userEvent.setup().press(screen.getByRole('switch', { name: 'Paguei só uma parte' }));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Paguei só uma parte' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Paguei só uma parte' })).toBeDisabled();
  });
});
