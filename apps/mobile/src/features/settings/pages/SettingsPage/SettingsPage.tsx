import { Mail, Repeat, Tag, LogOut } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { Screen } from '@/shared/components/Screen/Screen';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { APP_VERSION } from '@/shared/constants/appVersion';
import { doSignOut } from '@/shared/utils/actions/doSignOut';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

import { SettingsRow } from './components/SettingsRow/SettingsRow';

/** A terceira aba: quem está logado com a saída, o que se usa pouco e a versão do app. */
export function SettingsPage() {
  const email = signedInEmail(useAuthState());
  const { data: person } = useRealtime(allowedEmailQueryService, { email });
  const name = person?.name ?? '';

  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="headlineSmallEmphasized">Configurações</AppText>

        <View style={styles.signedIn}>
          <View style={styles.person}>
            <CircleMark size={40} color="secondaryContainer">
              <AppText variant="labelLargeEmphasized" color="onSecondaryContainer">
                {name.charAt(0).toUpperCase()}
              </AppText>
            </CircleMark>
            <View style={styles.texts}>
              <AppText variant="bodyLarge">{name}</AppText>
              <AppText variant="bodySmall" color="onSurfaceVariant">
                {email}
              </AppText>
              {person?.isAdmin ? (
                <AppText variant="labelMedium" color="primary">
                  Admin · você
                </AppText>
              ) : null}
            </View>
          </View>
          <IconButton icon={LogOut} label="Sair" onPress={() => doSignOut()} />
        </View>

        <View style={styles.section}>
          <AppText variant="labelMedium" color="onSurfaceVariant">
            Da família
          </AppText>
          <SettingsRow icon={Repeat} label="Contas recorrentes" />
          <SettingsRow icon={Tag} label="Tags" />
        </View>

        {person?.isAdmin ? (
          <View style={styles.section}>
            <AppText variant="labelMedium" color="onSurfaceVariant">
              Só para o admin
            </AppText>
            <SettingsRow icon={Mail} label="E-mails permitidos" />
          </View>
        ) : null}

        <AppText variant="labelSmall" color="onSurfaceVariant" style={styles.version}>
          {`Livro-Caixa · versão ${APP_VERSION}`}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    gap: theme.spacing.extraLarge,
    paddingTop: theme.spacing.small,
    paddingHorizontal: theme.spacing.largeIncreased,
    paddingBottom: theme.spacing.extraLarge,
  },
  signedIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.extraSmall,
    paddingVertical: theme.spacing.extraSmall,
    paddingLeft: theme.spacing.large,
    paddingRight: theme.spacing.extraSmall,
    borderRadius: theme.radii.largeIncreased,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  person: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.mediumIncreased,
    paddingVertical: theme.spacing.medium,
  },
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
  section: { gap: theme.spacing.extraExtraSmall },
  version: { marginTop: 'auto', textAlign: 'center' },
}));
