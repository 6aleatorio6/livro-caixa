import { router } from 'expo-router';
import { HandCoins, Pencil } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ContributionsSection } from '@/features/entries/components/ContributionsSection/ContributionsSection';
import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { OnlyAuthorNotice } from '@/features/entries/components/OnlyAuthorNotice/OnlyAuthorNotice';
import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { DetailRow } from '@/shared/components/DetailRow/DetailRow';
import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { formatPaymentTitle } from '@/shared/utils/date/formatPaymentTitle';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { findTag } from '@/shared/utils/tag/findTag';

import { EntryDetailsHeader } from '../EntryDetailsHeader/EntryDetailsHeader';

export interface IEntryDetailsContentProps {
  entry: IOwnedEntry;
}

/**
 * O corpo da folha de um lançamento com dono: o cabeçalho, as linhas, o comprovante, as contribuições que ele recebeu
 * e, no fim, o Contribuir de quem não o registrou e as ações do autor, ou o aviso de quem pode mudar. Com contribuições,
 * a folha diz com quanto quem pagou fica, e o Excluir fica desligado até elas saírem.
 */
export function EntryDetailsContent({ entry }: IEntryDetailsContentProps) {
  const authState = useAuthState();
  const { data: file } = useRealtime(receiptFileQueryService, { id: entry.receiptFileId });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});
  const { data: monthEntries } = useRealtime(entryMonthQueryService, { month: entry.month });

  const isPayment = entry.kind === 'recurringPayment';
  const isAuthor = authState.status === 'signedIn' && authState.user.uid === entry.paidBy;
  const authorName = memberNameOf(entry.paidBy, people ?? []);
  // Uma tag apagada (só pelo SDK) deixa a conta sem a linha da tag.
  const tag = findTag(entry.tagId, tags);
  // Até os lançamentos do mês chegarem, não se sabe se há contribuições: o Excluir e o Contribuir esperam.
  const isMonthKnown = Boolean(monthEntries);
  const contributions = contributionsOf(entry.id, monthEntries ?? []);
  const contributedCents = sumCents(contributions);
  const isClosed = isFullyContributed(entry, monthEntries ?? []);
  const deleteReason =
    contributions.length > 0
      ? `Com contribuições, ${isPayment ? 'o pagamento não pode ser excluído' : 'a conta não pode ser excluída'}.`
      : undefined;
  // Com contribuições, quem pagou fica com o valor pago menos elas.
  const payerPartRow =
    contributions.length > 0 ? (
      <DetailRow
        label={`Fica com ${isAuthor ? 'você' : authorName}`}
        value={formatCents(entry.amountCents - contributedCents)}
      />
    ) : null;

  return (
    <>
      <EntryDetailsHeader
        markKind={isPayment ? 'payment' : 'oneOff'}
        title={entry.name}
        subtitle={isPayment ? formatPaymentTitle(entry.month) : 'Conta avulsa'}
        amountCents={entry.amountCents}
        amountSupport={isPayment ? `previsto ${formatCents(entry.expectedAmountCents)}` : undefined}
      />

      <View>
        {entry.kind === 'recurringPayment' ? (
          <>
            <DetailRow label="Pago por" value={authorName} />
            {payerPartRow}
            <DetailRow label="Registrado em" value={formatIsoDate(entry.paidOn)} />
            <DetailRow label="Vencimento" value={`dia ${entry.dueDay}`} />
          </>
        ) : (
          <>
            <DetailRow label="Registrado por" value={authorName} />
            {payerPartRow}
            <DetailRow label="Data" value={formatIsoDate(entry.date)} />
          </>
        )}
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

      {contributions.length > 0 ? (
        <ContributionsSection
          contributions={contributions}
          people={people ?? []}
          closedReason={
            isClosed && !isAuthor ? 'Chegaram ao valor pago, então não dá para contribuir mais.' : undefined
          }
        />
      ) : null}

      {isAuthor ? (
        <View style={styles.authorActions}>
          <View style={styles.actions}>
            <DeleteEntryButton
              entry={entry}
              label="Excluir"
              disabled={!isMonthKnown}
              disabledReason={deleteReason}
              shouldShowReason={false}
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
          {/* O motivo fica embaixo da linha: dentro dela, ele espremeria o Alterar. */}
          {deleteReason ? (
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {deleteReason}
            </AppText>
          ) : null}
        </View>
      ) : (
        <>
          <Button
            label="Contribuir"
            variant="tonal"
            icon={HandCoins}
            disabled={!isMonthKnown || isClosed}
            onPress={() => router.push({ pathname: '/entries/[id]/contribute', params: { id: entry.id } })}
          />
          <OnlyAuthorNotice authorName={authorName} kind={entry.kind} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  authorActions: { gap: theme.spacing.small },
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium },
  change: { flex: 1 },
}));
