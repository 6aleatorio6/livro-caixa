import { CircleDashed } from 'lucide-react-native';

import { Button } from '@/shared/components/Button/Button';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IBillToPayItemProps {
  name: string;
  /** O valor previsto, em centavos. */
  expectedCents: number;
  /** O dia do vencimento no mês, de 1 a 31. */
  dueDay: number;
  /** O nome da tag; sem ele o detalhe não a cita. */
  tagName?: string;
  /** Abre o registro do pagamento: a linha inteira e o botão "Registrar" fazem o mesmo. */
  onPress: () => void;
}

/** Uma conta a pagar no mês: a marca `tertiaryContainer`, "R$ 119,90 · vence dia 15 · Serviços" e o botão "Registrar". */
export function BillToPayItem({ name, expectedCents, dueDay, tagName, onPress }: IBillToPayItemProps) {
  const detail = [formatCents(expectedCents), `vence dia ${dueDay}`, tagName].filter(Boolean).join(' · ');

  return (
    <ListItem
      icon={CircleDashed}
      title={name}
      support={detail}
      isCompact
      markColor="tertiaryContainer"
      iconColor="onTertiaryContainer"
      trailing={
        <Button
          label="Registrar"
          accessibilityLabel={`Registrar ${name}`}
          variant="tertiary"
          isCompact
          onPress={onPress}
        />
      }
      onPress={onPress}
    />
  );
}
