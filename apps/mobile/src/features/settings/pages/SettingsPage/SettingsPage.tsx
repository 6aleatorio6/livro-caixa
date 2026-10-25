import { router } from 'expo-router';
import { LogOut, Pencil, Repeat, Tag } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { IconButton } from '@/shared/components/IconButton/IconButton';
import { PersonItem } from '@/shared/components/PersonItem/PersonItem';
import { Screen } from '@/shared/components/Screen/Screen';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { APP_VERSION } from '@/shared/constants/appVersion';
import { doSignOut } from '@/shared/utils/actions/doSignOut';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

import { AdminSection } from './components/AdminSection/AdminSection';
import { SettingsRow } from './components/SettingsRow/SettingsRow';

/** A terceira aba: quem está logado com a saída, o que se usa pouco e a versão do app. */
export function SettingsPage() {
  const email = signedInEmail(useAuthState());
  const { data: person } = useRealtime(allowedEmailQueryService, { email });

  return (
    <Screen>
      <View style={styles.content}>
        <AppText variant="headlineSmallEmphasized">Configurações</AppText>

        <View style={styles.signedIn}>
          <View style={styles.person}>
            <PersonItem
              name={person?.name ?? null}
              email={email ?? ''}
              situation={person?.isAdmin ? 'Admin · você' : undefined}
              situationColor="primary"
            />
          </View>
          <IconButton icon={Pencil} label="Alterar nome" onPress={() => router.push('/change-name')} />
          <IconButton icon={LogOut} label="Sair da conta" onPress={() => doSignOut()} />
        </View>

        <View style={styles.section}>
          <AppText variant="labelMedium" color="onSurfaceVariant">
            Da família
          </AppText>
          <SettingsRow icon={Repeat} label="Contas recorrentes" />
          <SettingsRow icon={Tag} label="Tags" />
        </View>

        {person?.isAdmin ? <AdminSection /> : null}

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
  person: { flex: 1 },
  section: { gap: theme.spacing.extraExtraSmall },
  version: { marginTop: 'auto', textAlign: 'center' },
}));
