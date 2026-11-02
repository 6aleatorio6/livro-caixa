import { Lock } from 'lucide-react-native';

import { Notice } from '@/shared/components/Notice/Notice';
import type { IEntry } from '@/shared/types/entry/Entry';

export interface IOnlyAuthorNoticeProps {
  /** O primeiro nome de quem registrou. */
  authorName: string;
  kind: IEntry['kind'];
}

const SUBJECT_BY_KIND: Record<IEntry['kind'], string> = {
  recurringPayment: 'este pagamento',
  oneOffBill: 'esta conta',
  contribution: 'esta contribuição',
};

/** O aviso de quem lê o lançamento de outro membro: só o autor altera e exclui. */
export function OnlyAuthorNotice({ authorName, kind }: IOnlyAuthorNoticeProps) {
  return <Notice icon={Lock} text={`Só ${authorName} pode alterar ou excluir ${SUBJECT_BY_KIND[kind]}.`} />;
}
