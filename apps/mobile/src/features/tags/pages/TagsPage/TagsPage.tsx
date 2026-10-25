import { router } from 'expo-router';
import { Plus, Tag } from 'lucide-react-native';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText/AppText';
import { ExtendedFab } from '@/shared/components/ExtendedFab/ExtendedFab';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { oneOffBillTagIdsQueryService } from '@/shared/services/entry/query/oneOffBillTagIdsQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';

import { tagUsageParts } from '@/features/tags/utils/tagUsageParts';

/** A lista de tags da família, com quantas contas, recorrentes e avulsas, usam cada uma; o toque abre a alteração. */
export function TagsPage() {
  const { status, data: tags } = useRealtime(tagListQueryService, {});
  const { data: bills } = useRealtime(recurringBillListQueryService, {});
  const { data: oneOffTagIds } = useRealtime(oneOffBillTagIdsQueryService, {});

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

        {!tags && status !== 'error' ? <LoadingState /> : null}

        {tags?.length === 0 ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Nenhuma tag ainda.
          </AppText>
        ) : null}

        {tags ? (
          <View>
            {tags.map((tag) => {
              const colors = tagColorRoles(tag.color);
              // Sem as duas leituras, o apoio fica de fora: "Sem uso" seria um palpite.
              const parts = bills && oneOffTagIds ? tagUsageParts(bills, oneOffTagIds, tag.id) : null;
              return (
                <ListItem
                  key={tag.id}
                  icon={Tag}
                  title={tag.name}
                  support={parts === null ? undefined : parts.length === 0 ? 'Sem uso' : parts.join(' · ')}
                  markColor={colors.containerRole}
                  iconColor={colors.onContainerRole}
                  onPress={() => router.push(`/tags/${tag.id}`)}
                />
              );
            })}
          </View>
        ) : null}

      </ScreenContent>
      <ExtendedFab icon={Plus} label="Nova tag" onPress={() => router.push('/tags/new')} />
    </Screen>
  );
}
