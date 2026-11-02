import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { OnlyAuthorNotice } from '@/features/entries/components/OnlyAuthorNotice/OnlyAuthorNotice';
import { Button } from '@/shared/components/Button/Button';
import { DetailRow } from '@/shared/components/DetailRow/DetailRow';
import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { signedInUid } from '@/shared/utils/auth/signedInUid';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IEntry } from '@/shared/types/entry/Entry';
import { formatContributionTitle } from '@/shared/utils/date/formatContributionTitle';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { billAmountOf } from '@/shared/utils/entry/billAmountOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { targetOf } from '@/shared/utils/entry/targetOf';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { findTag } from '@/shared/utils/tag/findTag';

import { EntryDetailsHeader } from '../EntryDetailsHeader/EntryDetailsHeader';

export interface IContributionDetailsProps {
  entry: IContributionEntry;
}

/**
 * Para que conta a contribuição foi: "na conta Luz de R$ 187,35, paga por Ana"; no mês sem dono, "paga pelas
 * contribuições" quando elas alcançaram o previsto, ou "ainda a pagar", com o previsto. O protótipo diz "na Luz": o
 * artigo depende do nome da conta, que o app não sabe flexionar.
 */
function targetSupportOf(target: IBillEntry, entries: IEntry[], people: IAllowedEmailListItem[]) {
  if (target.paidBy !== null) {
    return `na conta ${target.name} de ${formatCents(target.amountCents)}, paga por ${memberNameOf(target.paidBy, people)}`;
  }
  return isFullyContributed(target, entries)
    ? `na conta ${target.name} de ${formatCents(billAmountOf(target, entries))}, paga pelas contribuições`
    : `na conta ${target.name} de ${formatCents(target.expectedAmountCents)}, ainda a pagar`;
}

/**
 * A folha de uma contribuição, a mesma do pagamento: a conta que ela recebe, o valor, quem contribuiu, quando, o
 * vencimento ou a data e a tag da conta, e o comprovante. Para quem contribuiu, Alterar e Excluir.
 */
export function ContributionDetails({ entry }: IContributionDetailsProps) {
  const authState = useAuthState();
  const { data: file } = useRealtime(receiptFileQueryService, { id: entry.receiptFileId });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});
  const { data: monthEntries } = useRealtime(entryMonthQueryService, { month: entry.month });

  const target = monthEntries ? targetOf(entry, monthEntries) : undefined;
  const isAuthor = signedInUid(authState) === entry.paidBy;
  const contributorName = memberNameOf(entry.paidBy, people ?? []);
  const tag = findTag(target?.tagId ?? null, tags);

  return (
    <>
      <EntryDetailsHeader
        markKind="contribution"
        title={target?.name ?? ''}
        subtitle={formatContributionTitle(entry.month)}
        amountCents={entry.amountCents}
        amountSupport={target && monthEntries ? targetSupportOf(target, monthEntries, people ?? []) : undefined}
      />

      <View>
        <DetailRow label="Contribuído por" value={contributorName} />
        <DetailRow label="Registrada em" value={formatIsoDate(entry.paidOn)} />
        {target?.kind === 'recurringPayment' ? <DetailRow label="Vencimento" value={`dia ${target.dueDay}`} /> : null}
        {target?.kind === 'oneOffBill' ? <DetailRow label="Data" value={formatIsoDate(target.date)} /> : null}
        {tag ? <DetailRow label="Tag" value={tag.name} tagColor={tag.color} /> : null}
      </View>

      <ReceiptSummary
        file={file ? { name: file.name, type: file.type, sizeBytes: file.sizeBytes } : null}
        disabled={!file}
        action={{
          label: 'Ver',
          onPress: () => router.push({ pathname: '/entries/[id]/receipt', params: { id: entry.id } }),
        }}
      />

      {isAuthor ? (
        <View style={styles.actions}>
          {/* A exclusão espera os lançamentos do mês: a última contribuição de um mês sem dono leva o pagamento junto. */}
          <DeleteEntryButton
            entry={entry}
            label="Excluir"
            monthEntries={monthEntries ?? []}
            disabled={!monthEntries}
            onDeleted={() => router.back()}
          />
          <View style={styles.change}>
            <Button
              label="Alterar"
              variant="tonal"
              icon={Pencil}
              onPress={() => router.push({ pathname: '/entries/[id]/edit', params: { id: entry.id } })}
            />
          </View>
        </View>
      ) : (
        <OnlyAuthorNotice authorName={contributorName} kind={entry.kind} />
      )}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium },
  change: { flex: 1 },
}));
