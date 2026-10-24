import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface ISettingsRowProps {
  icon: LucideIcon;
  label: string;
  /** O texto sob o rótulo, como a contagem de pessoas. */
  support?: string;
  /** Sem `onPress` a entrada é só leitura: não é um botão. */
  onPress?: () => void;
}

/** Uma entrada de Configurações. Só navega quando recebe `onPress`: as outras telas entram nos próximos grupos. */
export function SettingsRow({ icon: Icon, label, support, onPress }: ISettingsRowProps) {
  const { theme } = useUnistyles();

  const content = (
    <>
      <CircleMark size={40} color="secondaryContainer">
        <Icon size={20} color={theme.colors.onSecondaryContainer} />
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant="bodyLarge">{label}</AppText>
        {support ? (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {support}
          </AppText>
        ) : null}
      </View>
      <Decorative>
        <ChevronRight size={24} color={theme.colors.onSurfaceVariant} />
      </Decorative>
    </>
  );

  if (!onPress) return <View style={styles.row(false)}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => styles.row(pressed)}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: (isPressed: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.large,
    paddingVertical: theme.spacing.mediumIncreased,
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
