import { render, screen, userEvent } from '@testing-library/react-native';

import { SegmentedToggle } from './SegmentedToggle';

const OPTIONS = [
  { value: 'tag', label: 'Por tag' },
  { value: 'member', label: 'Por membro' },
] as const;

describe('SegmentedToggle', () => {
  it('Should announce only the active segment as selected', async () => {
    await render(<SegmentedToggle options={[...OPTIONS]} value="tag" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Por tag' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Por membro' })).not.toBeSelected();
  });

  it('Should call onChange with the value of the pressed segment', async () => {
    const onChange = jest.fn();
    await render(<SegmentedToggle options={[...OPTIONS]} value="tag" onChange={onChange} />);

    await userEvent.setup().press(screen.getByRole('tab', { name: 'Por membro' }));

    expect(onChange).toHaveBeenCalledWith('member');
  });
});
