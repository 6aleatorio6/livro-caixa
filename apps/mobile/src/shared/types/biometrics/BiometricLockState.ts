export interface IBiometricLockState {
  /** Se a pessoa ligou "Entrar com biometria" neste celular. Vem do arquivo do app, não do Firestore. */
  isEnabled: boolean;
  /** Se o app está esperando a biometria para abrir. */
  isLocked: boolean;
}
