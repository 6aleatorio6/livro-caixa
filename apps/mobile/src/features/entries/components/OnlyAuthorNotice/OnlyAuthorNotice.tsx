import { Lock } from 'lucide-react-native';

import { Notice } from '@/shared/components/Notice/Notice';
import type { IEntry } from '@/shared/types/entry/Entry';

export interface IOnlyAuthorNoticeProps {
  /** O primeiro nome de quem registrou. */
  authorName: string;
  kind: IEntry['kind'];
}

/** O aviso de quem lê o lançamento de outro membro: só o autor altera e exclui. */
export function OnlyAuthorNotice({ authorName, kind }: IOnlyAuthorNoticeProps) {
  return (
    <Notice
      icon={Lock}
      text={`Só ${authorName} pode alterar ou excluir ${kind === 'recurringPayment' ? 'este pagamento' : 'esta conta'}.`}
    />
  );
}
