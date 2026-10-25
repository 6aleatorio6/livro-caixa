import { router, useLocalSearchParams } from 'expo-router';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { EntryProblem } from '@/features/entries/components/EntryProblem/EntryProblem';
import { OnlyAuthorNotice } from '@/features/entries/components/OnlyAuthorNotice/OnlyAuthorNotice';
import { EditPaymentForm } from '@/features/entries/pages/EditEntryPage/components/EditPaymentForm/EditPaymentForm';
import { doUpdateEntry } from '@/features/entries/pages/EditEntryPage/utils/actions/doUpdateEntry';
import { OneOffBillForm } from '@/shared/components/OneOffBillForm/OneOffBillForm';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

/**
 * Onde quem registrou um lançamento corrige o que pode mudar nele: o valor e o comprovante do pagamento; o nome, o
 * valor, a data, a tag e o comprovante da conta avulsa. Quem não é o autor (chegou por um link) vê só o aviso de
 * quem pode, sem nenhum campo.
 */
export function EditEntryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const authState = useAuthState();
  const { status: entryStatus, data: entry } = useRealtime(entryQueryService, { id });
  const { status: fileStatus, data: file } = useRealtime(receiptFileQueryService, { id: entry?.receiptFileId ?? null });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});

  const isAuthor = entry && authState.status === 'signedIn' && authState.user.uid === entry.paidBy;
  // O formulário nasce com o que o comprovante é: só depois que o registro chegou (ou que se sabe que não existe).
  const isReceiptKnown = fileStatus === 'success' || fileStatus === 'cached';

  return (
    <Screen>
      {/* O título diz o tipo só depois de saber qual é: antes disso a barra fica sem título. */}
      <TopBar title={entry ? (entry.kind === 'oneOffBill' ? 'Alterar conta avulsa' : 'Alterar pagamento') : ''} />
      <ScreenContent>
        {entry && !isAuthor ? (
          <OnlyAuthorNotice authorName={memberNameOf(entry.paidBy, people ?? [])} kind={entry.kind} />
        ) : null}
        {isAuthor && isReceiptKnown && entry.kind === 'recurringPayment' ? (
          <EditPaymentForm
            entry={entry}
            tag={tags?.find((candidate) => candidate.id === entry.tagId)}
            currentReceipt={file ?? undefined}
            onSubmit={async (input) => {
              const { error } = await doUpdateEntry(input);
              if (!error) router.back();
            }}
            // O pagamento excluído não tem o que mostrar: sai da tela e da folha dos detalhes.
            onDeleted={() => router.dismiss(2)}
          />
        ) : null}
        {isAuthor && isReceiptKnown && entry.kind === 'oneOffBill' ? (
          <OneOffBillForm
            tags={tags ?? []}
            hasTagsError={tagsStatus === 'error'}
            initialValues={{ name: entry.name, amountCents: entry.amountCents, date: entry.date, tagId: entry.tagId }}
            currentReceipt={file ?? undefined}
            submitLabel="Salvar alterações"
            dateSupportText="A data define o mês em que a conta entra."
            footer={
              <DeleteEntryButton entry={entry} label="Excluir conta avulsa" onDeleted={() => router.dismiss(2)} />
            }
            onSubmit={async ({ receipt, ...changes }) => {
              const { error } = await doUpdateEntry({ entry, changes, receipt });
              if (!error) router.back();
            }}
          />
        ) : null}
        {/* Só o servidor diz que o lançamento não existe mais: a leitura do aparelho pode estar atrasada. */}
        {entryStatus === 'success' && !entry ? <EntryProblem reason="deleted" /> : null}
        {entryStatus === 'error' || fileStatus === 'error' ? <EntryProblem reason="unreadable" /> : null}
      </ScreenContent>
    </Screen>
  );
}
