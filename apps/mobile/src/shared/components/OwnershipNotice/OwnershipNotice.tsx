import { UserRound } from 'lucide-react-native';

import { Notice } from '@/shared/components/Notice/Notice';
import { useSignedInPersonName } from '@/shared/hooks/useSignedInPersonName/useSignedInPersonName';

export interface IOwnershipNoticeProps {
  /** O que fica no nome de quem registra, depois do "alterar ou excluir": "este pagamento", "esta conta". */
  subject: string;
}

/** O aviso dos formulários de registro: "Fica no seu nome, Ana. Só você poderá alterar ou excluir este pagamento." */
export function OwnershipNotice({ subject }: IOwnershipNoticeProps) {
  const personName = useSignedInPersonName();

  return (
    <Notice
      icon={UserRound}
      text={`Fica no seu nome${personName ? `, ${personName}` : ''}. Só você poderá alterar ou excluir ${subject}.`}
    />
  );
}
