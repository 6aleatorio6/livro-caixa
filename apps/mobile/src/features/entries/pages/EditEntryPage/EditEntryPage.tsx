import { router, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { EntryProblem } from '@/features/entries/components/EntryProblem/EntryProblem';
import { OnlyAuthorNotice } from '@/features/entries/components/OnlyAuthorNotice/OnlyAuthorNotice';
import { EditContributionForm } from '@/features/entries/pages/EditEntryPage/components/EditContributionForm/EditContributionForm';
import { EditMonthContributionForm } from '@/features/entries/pages/EditEntryPage/components/EditMonthContributionForm/EditMonthContributionForm';
import { EditPaymentForm } from '@/features/entries/pages/EditEntryPage/components/EditPaymentForm/EditPaymentForm';
import { doConvertEntry } from '@/features/entries/pages/EditEntryPage/utils/actions/doConvertEntry';
import { doUpdateEntry } from '@/features/entries/pages/EditEntryPage/utils/actions/doUpdateEntry';
import { Notice } from '@/shared/components/Notice/Notice';
import { OneOffBillForm } from '@/shared/components/OneOffBillForm/OneOffBillForm';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import type { IConvertEntryInput } from '@/shared/types/entry/ConvertEntryInput';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isAuthoredEntry } from '@/shared/utils/entry/isAuthoredEntry';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { targetOf } from '@/shared/utils/entry/targetOf';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { findTag } from '@/shared/utils/tag/findTag';

const TITLE_BY_KIND = {
  recurringPayment: 'Alterar pagamento',
  oneOffBill: 'Alterar conta avulsa',
  contribution: 'Alterar contribuição',
} as const;

// O lançamento alterado ou transformado sai da tela e da folha dos detalhes, que mostrava o de antes.
const leaveEditAndDetails = () => router.dismiss(2);

async function update(input: IUpdateEntryInput) {
  const { error } = await doUpdateEntry(input);
  if (!error) router.back();
}

async function convert(input: IConvertEntryInput) {
  const { error } = await doConvertEntry(input);
  if (!error) leaveEditAndDetails();
}

/**
 * Onde quem registrou um lançamento corrige o que pode mudar nele: o valor e o comprovante do pagamento e da
 * contribuição; o nome, o valor, a data, a tag e o comprovante da conta avulsa. O interruptor Paguei só uma parte
 * transforma o pagamento em contribuição, e a contribuição de um mês sem quem pagou no pagamento dele. Quem não é o
 * autor (chegou por um link) vê só o aviso de quem pode, sem nenhum campo.
 */
export function EditEntryPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const authState = useAuthState();
  const { status: entryStatus, data } = useRealtime(entryQueryService, { id });
  // O pagamento sem dono não se altera: cada contribuição é de quem contribuiu.
  const entry = data && isAuthoredEntry(data) ? data : null;
  const { data: monthEntries } = useRealtime(entryMonthQueryService, { month: entry?.month ?? null });
  const { status: fileStatus, data: file } = useRealtime(receiptFileQueryService, { id: entry?.receiptFileId ?? null });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});

  const isAuthor = entry && authState.status === 'signedIn' && authState.user.uid === entry.paidBy;
  // O formulário nasce com o que o comprovante é: só depois que o registro chegou (ou que se sabe que não existe).
  const isReceiptKnown = fileStatus === 'success' || fileStatus === 'cached';
  // A contribuição recebe um lançamento do mês: o formulário espera a leitura do mês para saber qual.
  const target = entry?.kind === 'contribution' && monthEntries ? targetOf(entry, monthEntries) : undefined;
  const contributions =
    entry && monthEntries
      ? contributionsOf(entry.kind === 'contribution' ? entry.entryId : entry.id, monthEntries)
      : [];
  const otherContributedCents = sumCents(
    contributions.filter(({ id: contributionId }) => contributionId !== entry?.id),
  );

  return (
    <Screen>
      {/* O título diz o tipo só depois de saber qual é: antes disso a barra fica sem título. */}
      <TopBar title={entry ? TITLE_BY_KIND[entry.kind] : ''} />
      <ScreenContent>
        {entry && !isAuthor ? (
          <OnlyAuthorNotice authorName={memberNameOf(entry.paidBy, people ?? [])} kind={entry.kind} />
        ) : null}
        {isAuthor && isReceiptKnown && monthEntries && entry.kind === 'recurringPayment' ? (
          <EditPaymentForm
            entry={entry}
            contributedCents={otherContributedCents}
            tag={findTag(entry.tagId, tags)}
            currentReceipt={file ?? undefined}
            onSubmit={async (input) => {
              const { error } = await doUpdateEntry(input);
              if (!error) router.back();
            }}
            onConvert={convert}
            // O pagamento excluído não tem o que mostrar: sai da tela e da folha dos detalhes.
            onDeleted={leaveEditAndDetails}
          />
        ) : null}
        {isAuthor && isReceiptKnown && monthEntries && entry.kind === 'contribution' && target ? (
          target.paidBy === null ? (
            <EditMonthContributionForm
              entry={entry}
              target={target}
              otherContributedCents={otherContributedCents}
              monthEntries={monthEntries}
              tag={findTag(target.tagId, tags)}
              currentReceipt={file ?? undefined}
              onSubmit={update}
              onConvert={convert}
              onDeleted={leaveEditAndDetails}
            />
          ) : (
            <EditContributionForm
              entry={entry}
              target={target}
              otherContributedCents={otherContributedCents}
              monthEntries={monthEntries}
              tag={findTag(target.tagId, tags)}
              currentReceipt={file ?? undefined}
              onSubmit={update}
              onDeleted={leaveEditAndDetails}
            />
          )
        ) : null}
        {isAuthor && isReceiptKnown && entry.kind === 'oneOffBill' ? (
          <OneOffBillForm
            tags={tags ?? []}
            hasTagsError={tagsStatus === 'error'}
            initialValues={{ name: entry.name, amountCents: entry.amountCents, date: entry.date, tagId: entry.tagId }}
            currentReceipt={file ?? undefined}
            entryId={entry.id}
            submitLabel="Salvar alterações"
            dateSupportText="A data define o mês em que a conta entra."
            footer={
              <DeleteEntryButton
                entry={entry}
                label="Excluir conta avulsa"
                disabledReason={
                  contributions.length > 0 ? 'Com contribuições, a conta não pode ser excluída.' : undefined
                }
                onDeleted={leaveEditAndDetails}
              />
            }
            onSubmit={async ({ receipt, ...changes }) => {
              const { error } = await doUpdateEntry({ entry, changes, receipt });
              if (!error) router.back();
            }}
          />
        ) : null}
        {/* O lançamento que a contribuição recebe saiu do mês (apagado, ou com a data trocada numa corrida): ela não tem
            o que alterar, mas quem contribuiu ainda a exclui. */}
        {isAuthor && monthEntries && entry.kind === 'contribution' && !target ? (
          <>
            <Notice icon={Info} text="O lançamento desta contribuição não está mais neste mês." />
            <DeleteEntryButton
              entry={entry}
              label="Excluir contribuição"
              monthEntries={monthEntries}
              onDeleted={leaveEditAndDetails}
            />
          </>
        ) : null}
        {/* Só o servidor diz que o lançamento não existe mais: a leitura do aparelho pode estar atrasada. */}
        {entryStatus === 'success' && !entry ? <EntryProblem reason="deleted" /> : null}
        {entryStatus === 'error' || fileStatus === 'error' ? <EntryProblem reason="unreadable" /> : null}
      </ScreenContent>
    </Screen>
  );
}
