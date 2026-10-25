import * as SplashScreen from 'expo-splash-screen';

// A splash fica até a sessão carregar: sem isso, quem já entrou veria a tela de login piscar.
SplashScreen.preventAutoHideAsync();

export interface ISplashScreenControllerProps {
  isLoading: boolean;
}

/** Esconde a splash quando a sessão termina de carregar, no padrão da doc do expo-router. */
export function SplashScreenController({ isLoading }: ISplashScreenControllerProps) {
  if (!isLoading) SplashScreen.hide();
  return null;
}
