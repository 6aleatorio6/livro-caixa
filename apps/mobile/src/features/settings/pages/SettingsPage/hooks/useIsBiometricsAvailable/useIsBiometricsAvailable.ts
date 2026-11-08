import { isEnrolledAsync } from 'expo-local-authentication';
import { useEffect, useState } from 'react';

/**
 * Se a pessoa cadastrou uma digital ou um rosto no celular. No Android `isEnrolledAsync` já exige o leitor
 * (`canAuthenticate` com `BIOMETRIC_WEAK` devolve sucesso só com leitor e cadastro), então não se confere o leitor à
 * parte. Confere uma vez, ao montar: até a resposta chegar, e se a conferência falhar, vale que não dá, e a opção não
 * aparece.
 */
export function useIsBiometricsAvailable() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function checkAvailability() {
      try {
        const isAvailableNow = await isEnrolledAsync();
        if (isCurrent) setIsAvailable(isAvailableNow);
      } catch (error) {
        console.warn('Não deu para conferir se o celular tem biometria cadastrada.', error);
      }
    }

    void checkAvailability();
    return () => {
      isCurrent = false;
    };
  }, []);

  return isAvailable;
}
