import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { PersonItem } from '@/shared/components/PersonItem/PersonItem';
import { Screen } from '@/shared/components/Screen/Screen';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';
import { peopleCount } from '@/shared/utils/format/peopleCount';

/** A lista de e-mails permitidos, só para o admin: quem está na família e o que impede cada um de sair. */
export function AllowedEmailsPage() {
  const email = signedInEmail(useAuthState());
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  function situationOf(person: IAllowedEmailListItem) {
    if (person.isAdmin) {
      return email !== null && allowedEmailId(email) === person.email ? 'Admin · você' : 'Admin';
    }
    return person.hasEntries ? 'Tem lançamentos: não sai da lista' : 'Sem lançamentos';
  }

  return (
    <Screen>
      <TopBar title="E-mails permitidos" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          Só entra no app quem está nesta lista, com a conta Google deste e-mail.
        </AppText>

        {people ? (
          <View>
            <View style={styles.title}>
              <AppText variant="titleMediumEmphasized">Na família</AppText>
              <AppText variant="labelMedium" color="onSurfaceVariant">
                {peopleCount(people.length)}
              </AppText>
            </View>
            {people.map((person) => (
              <PersonItem
                key={person.email}
                name={person.name}
                email={person.email}
                situation={situationOf(person)}
                situationColor={person.isAdmin ? 'primary' : 'onSurfaceVariant'}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.extraLarge,
    paddingTop: theme.spacing.small,
    paddingHorizontal: theme.spacing.largeIncreased,
    paddingBottom: theme.spacing.extraLarge,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.extraSmallIncreased,
  },
}));
