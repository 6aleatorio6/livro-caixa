import { router } from 'expo-router';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { TagForm } from '@/features/tags/components/TagForm/TagForm';
import { doCreateTag } from '@/features/tags/utils/actions/doCreateTag';

/** Onde qualquer membro cria uma tag: o nome e uma das oito cores. */
export function NewTagPage() {
  const { status, data: tags } = useRealtime(tagListQueryService, {});

  return (
    <Screen>
      <TopBar title="Nova tag" />
      <ScreenContent gap="largeIncreased">
        <TagForm
          tags={tags ?? []}
          submitLabel="Criar tag"
          isListLoaded={status === 'success'}
          onSubmit={async (values) => {
            const { error } = await doCreateTag(values);
            if (!error) router.back();
          }}
        />
        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}
