import { UserRound } from 'lucide-react-native';

import { Notice } from '@/shared/components/Notice/Notice';
import { useSignedInPersonName } from '@/shared/hooks/useSignedInPersonName/useSignedInPersonName';

export interface IOwnershipNoticeProps {
  /** O que fica no nome de quem registra, depois do "alterar ou excluir": "este pagamento", "esta conta". */
  subject: string;
  /** A frase que toma o lugar do "Só você poderá alterar ou excluir…": o que acontece com a conta depois. */
  consequence?: string;
}

/**
 * O aviso dos formulários de registro: "Fica no seu nome, Ana. Só você poderá alterar ou excluir este pagamento.";
 * com a consequência, "Fica no seu nome, Bruno. O Aluguel continua a pagar pelo que faltar."
 */
export function OwnershipNotice({ subject, consequence }: IOwnershipNoticeProps) {
  const personName = useSignedInPersonName();

  return (
    <Notice
      icon={UserRound}
      text={`Fica no seu nome${personName ? `, ${personName}` : ''}. ${consequence ?? `Só você poderá alterar ou excluir ${subject}.`}`}
    />
  );
}
