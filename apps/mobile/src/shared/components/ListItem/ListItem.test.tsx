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

  // A tag aparece só como a bolinha da cor dela: quem não vê a cor ouve o nome dela depois do título.
  it('Should add the tag name to the button label, without writing it', async () => {
    await render(
      <ListItem
        icon={Tag}
        title="Água"
        support="R$ 98,00 · vence dia 20"
        tag={{ id: 'caragua', name: 'Caraguá', nameKey: 'caragua', color: 'blue' }}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Água, Caraguá' })).toBeOnTheScreen();
    expect(screen.queryByText(/Caraguá/)).not.toBeOnTheScreen();
  });

  it('Should label the button with the accessibilityLabel instead of the title and the tag', async () => {
    await render(
      <ListItem
        icon={Tag}
        title="Luz"
        tag={{ id: 'servicos', name: 'Serviços', nameKey: 'servicos', color: 'blue' }}
        accessibilityLabel="Luz, contribuição em 11/10 · Ana, R$ 40,00"
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Luz, contribuição em 11/10 · Ana, R$ 40,00' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Luz, Serviços' })).toBeNull();
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

  describe('When isOn is defined', () => {
    const SUPPORT = 'Pede a digital ou o rosto ao abrir o app e depois de 10 minutos fora';

    async function renderSwitch(isOn: boolean) {
      const onPress = jest.fn();
      await render(
        <ListItem icon={Tag} title="Entrar com biometria" support={SUPPORT} isOn={isOn} onPress={onPress} />,
      );
      return { onPress };
    }

    it('Should be a checked switch when it is on', async () => {
      await renderSwitch(true);

      expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).toBeChecked();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('Should be an unchecked switch when it is off', async () => {
      await renderSwitch(false);

      expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).not.toBeChecked();
    });

    it('Should read the support text as the hint and show it whole', async () => {
      await renderSwitch(false);

      expect(screen.getByRole('switch', { name: 'Entrar com biometria' })).toHaveProp('accessibilityHint', SUPPORT);
      expect(screen.getByText(SUPPORT)).not.toHaveProp('numberOfLines', 1);
    });

    it('Should call onPress and show no chevron, since the switch is what sits to the right', async () => {
      const { onPress } = await renderSwitch(false);

      await userEvent.setup().press(screen.getByRole('switch', { name: 'Entrar com biometria' }));

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('list-item-chevron', { includeHiddenElements: true })).toBeNull();
    });
  });
});
