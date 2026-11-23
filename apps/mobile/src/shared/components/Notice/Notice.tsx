import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import type { INoticeTone } from '@/shared/types/components/NoticeTone';

export interface INoticeProps {
  /** O ícone à esquerda do texto: `Info` para um aviso do que muda, `UserRound` para quem registra, `AlarmClock` para o atraso. */
  icon: LucideIcon;
  text: string;
  /** `neutral` (o padrão) é o bloco `surfaceContainer`; `error` é o `errorContainer`, do aviso de um atraso. */
  tone?: INoticeTone;
}

const COLORS_BY_TONE: Record<INoticeTone, { background: IColorRole; content: IColorRole }> = {
  neutral: { background: 'surfaceContainer', content: 'onSurfaceVariant' },
  error: { background: 'errorContainer', content: 'onErrorContainer' },
};

/** O aviso de uma tela: um bloco com um ícone e uma frase que explica algo sem pedir nada. */
export function Notice({ icon: Icon, text, tone = 'neutral' }: INoticeProps) {
  const { theme } = useUnistyles();
  const { background, content } = COLORS_BY_TONE[tone];

  return (
    <View style={styles.notice(background)}>
      <Decorative>
        <Icon size={20} color={theme.colors[content]} />
      </Decorative>
      <AppText variant="bodySmall" color={content} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  notice: (background: IColorRole) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smallIncreased,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.medium,
    backgroundColor: theme.colors[background],
  }),
  text: { flex: 1 },
}));
