import { Tag } from 'lucide-react-native';
import { render, screen, userEvent } from '@testing-library/react-native';

import { AppText } from '@/shared/components/AppText/AppText';

import { ListItem } from './ListItem';

describe('ListItem', () => {
  it('Should be a button labelled by the title and call onPress when it has onPress', async () => {
    const onPress = jest.fn();
    await render(<ListItem icon={Tag} title="Tags" support="Casa, Saúde" onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: 'Tags' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Should be read only, with the support text, when it has no onPress', async () => {
    await render(<ListItem icon={Tag} title="Tags" support="Casa, Saúde" />);

    expect(screen.getByText('Tags')).toBeOnTheScreen();
    expect(screen.getByText('Casa, Saúde')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Should show the trailing content to the right of the texts', async () => {
    await render(<ListItem icon={Tag} title="Internet" trailing={<AppText>R$ 119,90</AppText>} />);

    expect(screen.getByText('R$ 119,90')).toBeOnTheScreen();
  });

  it('Should show the chevron when it is pressable and has no trailing content', async () => {
    await render(<ListItem icon={Tag} title="Tags" onPress={jest.fn()} />);

    expect(screen.getByTestId('list-item-chevron', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('Should not show the chevron when it has trailing content', async () => {
    await render(<ListItem icon={Tag} title="Internet" trailing={<AppText>R$ 119,90</AppText>} onPress={jest.fn()} />);

    expect(screen.queryByTestId('list-item-chevron', { includeHiddenElements: true })).toBeNull();
  });

  it('Should not show the chevron when it is read only', async () => {
    await render(<ListItem icon={Tag} title="Tags" />);

    expect(screen.queryByTestId('list-item-chevron', { includeHiddenElements: true })).toBeNull();
  });
});
