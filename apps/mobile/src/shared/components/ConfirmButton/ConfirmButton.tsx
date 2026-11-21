import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog, type IConfirmDialogProps } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import type { IButtonVariant } from '@/shared/types/components/ButtonVariant';

export interface IConfirmButtonProps {
  /** O rótulo do botão que abre a confirmação ("Pular outubro"). */
  label: string;
  variant?: IButtonVariant;
  /** O título do diálogo ("Pular a Internet de outubro?"). */
  title: string;
  message?: string;
  /** O rótulo da ação que confirma ("Pular"). */
  confirmLabel: string;
  confirmVariant?: IConfirmDialogProps['confirmVariant'];
  /** O pedido confirmado está em andamento: o botão fica ocupado e não abre o diálogo de novo. */
  isLoading?: boolean;
  /** Chamado depois que o diálogo fecha, com a ação confirmada. */
  onConfirm: () => void | Promise<void>;
}

/** O botão que abre o diálogo de confirmação; confirmada, o diálogo fecha e `onConfirm` faz a ação. */
export function ConfirmButton({
  label,
  variant,
  title,
  message,
  confirmLabel,
  confirmVariant,
  isLoading,
  onConfirm,
}: IConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  async function confirm() {
    setIsConfirming(false);
    await onConfirm();
  }

  return (
    <>
      <Button label={label} variant={variant} isLoading={isLoading} onPress={() => setIsConfirming(true)} />
      <ConfirmDialog
        visible={isConfirming}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        confirmVariant={confirmVariant}
        onConfirm={confirm}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
