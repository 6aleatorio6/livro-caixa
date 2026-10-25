import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { OnlyAuthorNotice } from '@/features/entries/components/OnlyAuthorNotice/OnlyAuthorNotice';
import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { DetailRow } from '@/shared/components/DetailRow/DetailRow';
import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { receiptFileQueryService } from '@/shared/services/file/query/receiptFileQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import type { IEntry } from '@/shared/types/entry/Entry';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { formatPaymentTitle } from '@/shared/utils/date/formatPaymentTitle';
import { entryMarkOf } from '@/shared/utils/entry/entryMarkOf';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

export interface IEntryDetailsContentProps {
  entry: IEntry;
}

/** O corpo da folha: o cabeçalho, o valor, as linhas, o comprovante e, no fim, as ações do autor ou o aviso de quem pode mudar. */
export function EntryDetailsContent({ entry }: IEntryDetailsContentProps) {
  const { theme } = useUnistyles();
  const authState = useAuthState();
  const { data: file } = useRealtime(receiptFileQueryService, { id: entry.receiptFileId });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});

  const isPayment = entry.kind === 'recurringPayment';
  const isAuthor = authState.status === 'signedIn' && authState.user.uid === entry.paidBy;
  const authorName = memberNameOf(entry.paidBy, people ?? []);
  // Uma tag apagada (só pelo SDK) deixa a conta sem a linha da tag.
  const tag = tags?.find((candidate) => candidate.id === entry.tagId);
  const { icon: Icon, markColor, iconColor } = entryMarkOf(isPayment ? 'payment' : 'oneOff');

  return (
    <>
      <View style={styles.header}>
        <CircleMark size={40} color={markColor}>
          <Icon size={20} color={theme.colors[iconColor]} />
        </CircleMark>
        <View style={styles.title}>
          <AppText variant="titleLarge" numberOfLines={2}>
            {entry.name}
          </AppText>
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            {isPayment ? formatPaymentTitle(entry.month) : 'Conta avulsa'}
          </AppText>
        </View>
      </View>

      <View style={styles.amount}>
        <AppText variant="headlineMediumEmphasized">{formatCents(entry.amountCents)}</AppText>
        {isPayment ? (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {`previsto ${formatCents(entry.expectedAmountCents)}`}
          </AppText>
        ) : null}
      </View>

      <View>
        {entry.kind === 'recurringPayment' ? (
          <>
            <DetailRow label="Pago por" value={authorName} />
            <DetailRow label="Registrado em" value={formatIsoDate(entry.paidOn)} />
            <DetailRow label="Vencimento" value={`dia ${entry.dueDay}`} />
          </>
        ) : (
          <>
            <DetailRow label="Registrado por" value={authorName} />
            <DetailRow label="Data" value={formatIsoDate(entry.date)} />
          </>
        )}
        {tag ? <DetailRow label="Tag" value={tag.name} tagColor={tag.color} /> : null}
      </View>

      <ReceiptSummary
        file={file ? { name: file.name, type: file.type, sizeBytes: file.sizeBytes } : null}
        actionLabel="Ver"
        disabled={!file}
        onPress={() => router.push({ pathname: '/entries/[id]/receipt', params: { id: entry.id } })}
      />

      {isAuthor ? (
        <View style={styles.actions}>
          <DeleteEntryButton entry={entry} label="Excluir" onDeleted={() => router.back()} />
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
        <OnlyAuthorNotice authorName={authorName} kind={entry.kind} />
      )}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.mediumIncreased },
  title: { flex: 1, gap: theme.spacing.extraExtraSmall },
  amount: { gap: theme.spacing.extraExtraSmall },
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium },
  change: { flex: 1 },
}));
