import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { showToast } from '@/core/utils/storeActions/showToast';

import { AddPersonCard } from './components/AddPersonCard/AddPersonCard';
import { doRemoveAllowedEmail } from './utils/actions/doRemoveAllowedEmail';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
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
import { displayNameOf } from '@/shared/utils/person/displayNameOf';

/** A lista de e-mails permitidos, só para o admin: quem está na família e o que impede cada um de sair. */
export function AllowedEmailsPage() {
  const email = signedInEmail(useAuthState());
  const { status, data: people } = useRealtime(allowedEmailListQueryService, {});

  function situationOf(person: IAllowedEmailListItem) {
    // Sem nome, a pessoa ainda não entrou: o nome vem da conta Google na primeira entrada.
    if (person.name === null) return 'Ainda não entrou';
    if (person.isAdmin) {
      return email !== null && allowedEmailId(email) === person.email ? 'Admin · você' : 'Admin';
    }
    return person.hasEntries ? 'Tem lançamentos: não sai da lista' : 'Sem lançamentos';
  }

  // A regra do Firestore só deixa tirar quem não é admin e não tem lançamentos. Um documento feito à
  // mão no console pode não ter os campos: sem o `false` explícito, a pessoa não sai.
  function canRemove(person: IAllowedEmailListItem) {
    return person.isAdmin === false && person.hasEntries === false;
  }

  // O aviso é da tela, e não da ação: a ação só sabe o e-mail, que é o que o serviço pede.
  async function removePerson(person: IAllowedEmailListItem) {
    const { error } = await doRemoveAllowedEmail({ email: person.email });
    if (!error) showToast(`${displayNameOf(person)} saiu da lista`, 'success');
  }

  return (
    <Screen>
      <TopBar title="E-mails permitidos" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          Só entra no app quem está nesta lista, com a conta Google deste e-mail.
        </AppText>

        <AddPersonCard people={people ?? []} isListLoaded={status === 'success'} />

        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : null}

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
                trailing={
                  canRemove(person) ? (
                    <Button
                      label="Remover"
                      accessibilityLabel={`Remover ${displayNameOf(person)}`}
                      variant="textDestructive"
                      onPress={() => removePerson(person)}
                    />
                  ) : undefined
                }
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
