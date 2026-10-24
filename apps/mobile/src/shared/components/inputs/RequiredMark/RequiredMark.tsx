import { AppText } from '@/shared/components/AppText/AppText';

/** Vai dentro do `AppText` do rótulo, logo depois do texto. */
export function RequiredMark() {
  // O leitor de tela não lê o `*`: quem anuncia o obrigatório é o próprio campo, na dica de acessibilidade.
  return (
    <AppText color="error" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {' *'}
    </AppText>
  );
}
