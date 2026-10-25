import { router, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { oneOffBillTagIdsQueryService } from '@/shared/services/entry/query/oneOffBillTagIdsQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { TagForm } from '@/features/tags/components/TagForm/TagForm';
import { doUpdateTag } from '@/features/tags/utils/actions/doUpdateTag';
import { tagUsageParts } from '@/features/tags/utils/tagUsageParts';

import { DeleteTagSection } from './components/DeleteTagSection/DeleteTagSection';

/** Onde qualquer membro troca o nome e a cor de uma tag, ou a exclui quando nenhuma conta, recorrente ou avulsa, a usa. */
export function EditTagPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, data: tags } = useRealtime(tagListQueryService, {});
  const { data: bills } = useRealtime(recurringBillListQueryService, {});
  const { data: oneOffTagIds } = useRealtime(oneOffBillTagIdsQueryService, {});
  const tag = tags?.find((candidate) => candidate.id === id);

  return (
    <Screen>
      <TopBar title="Alterar tag" />
      <ScreenContent>
        {/* O formulário começa com a tag atual: só nasce com a tag na lista lida. */}
        {tags && tag ? (
          <TagForm
            tags={tags}
            tagId={tag.id}
            initialValues={{ name: tag.name, color: tag.color }}
            submitLabel="Salvar alterações"
            isListLoaded={status === 'success'}
            onSubmit={async (values) => {
              const { error } = await doUpdateTag({ id: tag.id, ...values });
              if (!error) router.back();
            }}
          >
            {/* Sem as duas listas de contas lidas, não dá para saber se a tag está em uso: a exclusão espera. */}
            {bills && oneOffTagIds ? (
              <DeleteTagSection tag={tag} parts={tagUsageParts(bills, oneOffTagIds, tag.id)} onDeleted={() => router.back()} />
            ) : null}
          </TagForm>
        ) : null}
        {/* Só o servidor diz que a tag não existe mais: a lista do aparelho pode estar atrasada. */}
        {status === 'success' && !tag ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Esta tag foi excluída.
          </AppText>
        ) : null}
        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a tag.
          </AppText>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}
