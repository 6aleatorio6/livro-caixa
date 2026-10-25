import { router } from 'expo-router';
import { Plus, Tag } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { ExtendedFab } from '@/shared/components/ExtendedFab/ExtendedFab';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { recurringBillCount } from '@/shared/utils/format/recurringBillCount';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';

import { countRecurringBillsOfTag } from '@/features/tags/utils/countRecurringBillsOfTag';

/** A lista de tags da família, com quantas contas recorrentes usam cada uma; o toque abre a alteração. */
export function TagsPage() {
  const { status, data: tags } = useRealtime(tagListQueryService, {});
  const { data: bills } = useRealtime(recurringBillListQueryService, {});

  return (
    <Screen>
      <TopBar title="Tags" />
      <ScreenContent gap="medium">
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          As tags classificam as contas recorrentes e as avulsas. A cor sai de uma lista de oito.
        </AppText>

        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : null}

        {tags?.length === 0 ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Nenhuma tag ainda.
          </AppText>
        ) : null}

        {tags ? (
          <View>
            {tags.map((tag) => {
              const colors = tagColorRoles(tag.color);
              // Sem a lista de contas lida, o apoio fica de fora: "Sem uso" seria um palpite.
              const count = bills ? countRecurringBillsOfTag(bills, tag.id) : null;
              return (
                <ListItem
                  key={tag.id}
                  icon={Tag}
                  title={tag.name}
                  support={count === null ? undefined : count === 0 ? 'Sem uso' : recurringBillCount(count)}
                  markColor={colors.containerRole}
                  iconColor={colors.onContainerRole}
                  onPress={() => router.push(`/tags/${tag.id}`)}
                />
              );
            })}
          </View>
        ) : null}

        <View style={styles.action}>
          <ExtendedFab icon={Plus} label="Nova tag" onPress={() => router.push('/tags/new')} />
        </View>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  action: { alignItems: 'flex-end', paddingTop: theme.spacing.extraExtraExtraLarge },
}));
