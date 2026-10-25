import { router, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { TagForm } from '@/features/tags/components/TagForm/TagForm';
import { doUpdateTag } from '@/features/tags/utils/actions/doUpdateTag';
import { countRecurringBillsOfTag } from '@/features/tags/utils/countRecurringBillsOfTag';

import { DeleteTagSection } from './components/DeleteTagSection/DeleteTagSection';

/** Onde qualquer membro troca o nome e a cor de uma tag, ou a exclui quando nenhuma conta a usa. */
export function EditTagPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, data: tags } = useRealtime(tagListQueryService, {});
  const { data: bills } = useRealtime(recurringBillListQueryService, {});
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
            {/* Sem a lista de contas lida, não dá para saber se a tag está em uso: a exclusão espera. */}
            {bills ? (
              <DeleteTagSection tag={tag} usedByCount={countRecurringBillsOfTag(bills, tag.id)} onDeleted={() => router.back()} />
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
