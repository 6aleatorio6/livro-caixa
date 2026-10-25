import { Hourglass, LogOut, RefreshCw } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { Screen } from '@/shared/components/Screen/Screen';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';

import { doSignOut } from '@/shared/utils/actions/doSignOut';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

/** Para quem entrou com um e-mail do Google fora da lista: só o aviso e a saída. */
export function NoAccessPage() {
  const { theme } = useUnistyles();
  const email = signedInEmail(useAuthState());
  const whichEmail = email ? `O e-mail ${email}` : 'Este e-mail';

  return (
    <Screen>
      <View style={styles.content}>
        <CircleMark size={72} color="tertiaryContainer">
          <Hourglass size={32} color={theme.colors.onTertiaryContainer} />
        </CircleMark>
        <AppText variant="headlineSmallEmphasized">Aguardando permissão</AppText>
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          {`${whichEmail} ainda não está na lista da família. Peça a quem administra o Livro-Caixa para liberá-lo.`}
        </AppText>
        <View style={styles.notice}>
          <Decorative>
            <RefreshCw size={20} color={theme.colors.onSurfaceVariant} />
          </Decorative>
          <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.noticeText}>
            Assim que o e-mail for liberado, o app abre sozinho.
          </AppText>
        </View>
        <View style={styles.space} />
        <Button label="Sair" variant="outlined" icon={LogOut} onPress={() => doSignOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.largeIncreased,
    paddingHorizontal: theme.spacing.extraExtraLarge,
    paddingBottom: theme.spacing.extraExtraExtraLarge,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smallIncreased,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.mediumIncreased,
    borderRadius: theme.radii.medium,
    backgroundColor: theme.colors.surfaceContainer,
  },
  noticeText: { flex: 1 },
  space: { height: theme.spacing.small },
}));
