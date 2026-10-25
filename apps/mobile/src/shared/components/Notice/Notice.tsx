import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface INoticeProps {
  /** O ícone à esquerda do texto: `Info` para um aviso do que muda, `UserRound` para quem registra. */
  icon: LucideIcon;
  text: string;
}

/** O aviso de uma tela: um bloco `surfaceContainer` com um ícone e uma frase que explica algo sem pedir nada. */
export function Notice({ icon: Icon, text }: INoticeProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.notice}>
      <Decorative>
        <Icon size={20} color={theme.colors.onSurfaceVariant} />
      </Decorative>
      <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smallIncreased,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.medium,
    backgroundColor: theme.colors.surfaceContainer,
  },
  text: { flex: 1 },
}));
