import { isEnrolledAsync } from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Se a pessoa cadastrou uma digital ou um rosto no celular. No Android `isEnrolledAsync` já exige o leitor
 * (`canAuthenticate` com `BIOMETRIC_WEAK` devolve sucesso só com leitor e cadastro), então não se confere o leitor à
 * parte. Confere ao montar e de novo cada vez que o app volta à frente: a aba Configurações continua montada, e quem
 * cadastra a digital nas configurações do Android volta ao app esperando ver a opção. Até a primeira resposta, e se a
 * conferência falhar, vale o que se sabia (de início, que não dá).
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
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void checkAvailability();
    });
    return () => {
      isCurrent = false;
      subscription.remove();
    };
  }, []);

  return isAvailable;
}
